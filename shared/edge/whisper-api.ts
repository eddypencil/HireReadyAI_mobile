import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
        "Content-Type, Authorization, x-client-info, apikey, x-region",
};

// Groq runs whisper-large-v3 on dedicated hardware — always warm, ~1s per request
// Docs: https://console.groq.com/docs/speech-text
const GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/** Resolve the correct Content-Type from the storage file path extension. */
function mimeFromPath(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "m4a") return "audio/x-m4a";   // HF accepts audio/x-m4a, NOT audio/mp4
    if (ext === "mp4") return "audio/mpeg";
    if (ext === "mp3") return "audio/mpeg";
    if (ext === "ogg") return "audio/ogg";
    if (ext === "wav") return "audio/wav";
    if (ext === "flac") return "audio/flac";
    return "audio/webm"; // default / fallback
}

/** Statuses that are worth retrying (transient gateway errors). */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503]);

/**
 * Transcribe audio via Groq's OpenAI-compatible Whisper endpoint.
 * Uses multipart/form-data — same interface as OpenAI Audio API.
 * Groq keeps whisper-large-v3 warm; typical latency is <2s.
 */
async function transcribeWithRetry(
    audioBlob: Blob,
    apiKey: string,
    fileName: string,       // used as the filename in the multipart form
    retries = MAX_RETRIES,
) {
    let lastError = "Unknown error";

    for (let attempt = 0; attempt < retries; attempt++) {
        let response: Response;
        try {
            const form = new FormData();
            form.append("file", audioBlob, fileName);
            form.append("model", "whisper-large-v3");
            form.append("response_format", "json");

            // 30-second hard timeout per attempt (Groq is fast)
            response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: { Authorization: `Bearer ${apiKey}` },
                body: form,
                signal: AbortSignal.timeout(30_000),
            });
        } catch (fetchErr) {
            lastError = (fetchErr as Error).message;
            console.warn(`[whisper/groq] attempt ${attempt + 1} fetch error: ${lastError}`);
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
            continue;
        }

        if (response.ok) {
            return response;
        }

        let body: Record<string, unknown> = {};
        try { body = await response.json(); } catch { /* ignore */ }

        lastError = `Groq ${response.status}: ${JSON.stringify(body)}`;
        console.warn(`[whisper/groq] attempt ${attempt + 1} failed — ${lastError}`);

        if (!RETRYABLE_STATUSES.has(response.status)) {
            throw new Error(lastError);
        }

        // 429 rate-limit: respect Retry-After header if present
        const retryAfter = response.headers.get("retry-after");
        const wait = retryAfter
            ? Math.min(parseInt(retryAfter, 10) * 1000, 30_000)
            : RETRY_DELAY_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, wait));
    }

    throw new Error(`Max retries exceeded. Last error: ${lastError}`);
}

// deno-lint-ignore no-explicit-any
function extractText(result: any): string | null {
    if (typeof result.text === "string") return result.text.trim();
    if (Array.isArray(result) && result[0]?.text) return result[0].text.trim();
    return null;
}

// deno-lint-ignore no-explicit-any
function extractConfidence(result: any): number | null {
    if (result.confidence !== undefined) return result.confidence;
    if (Array.isArray(result) && result[0]?.confidence !== undefined)
        return result[0].confidence;
    return null;
}

/**
 * Helper: patch the generation_context JSONB on application_questions
 * without overwriting other keys already stored there.
 */
async function patchGenerationContext(
    supabase: ReturnType<typeof createClient>,
    questionId: string,
    patch: Record<string, unknown>,
) {
    // Fetch current context first to merge
    const { data } = await supabase
        .from("application_questions")
        .select("generation_context")
        .eq("id", questionId)
        .single();

    const current = data?.generation_context ?? {};

    await supabase
        .from("application_questions")
        .update({ generation_context: { ...current, ...patch } })
        .eq("id", questionId);
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return new Response("Method not allowed", {
            status: 405,
            headers: corsHeaders,
        });
    }

    // Accept either inline base64 audio OR a Supabase Storage path
    const { audioPath, audioBase64, fileName: inlineFileName, questionId } = await req.json();

    if (!audioBase64 && !audioPath) {
        return new Response(JSON.stringify({ error: "audioBase64 or audioPath is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SB_SERVICE_KEY") ?? "",
    );

    // Mark as processing
    if (questionId) {
        await patchGenerationContext(supabase, questionId, {
            transcription_status: "processing",
        });
    }

    // ── Resolve audio blob ─────────────────────────────────────────────────
    let audioBlob: Blob;
    let resolvedFileName: string;

    if (audioBase64 && inlineFileName) {
        // Direct mode: audio sent inline — no storage round-trip, fastest path
        console.log("[whisper] direct mode, file:", inlineFileName);
        const mimeType = mimeFromPath(inlineFileName);
        const bytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
        audioBlob = new Blob([bytes], { type: mimeType });
        resolvedFileName = inlineFileName;
    } else {
        // Storage mode: download from Supabase Storage (used by retry path)
        console.log("[whisper] storage mode, path:", audioPath);
        if (questionId) {
            await patchGenerationContext(supabase, questionId, {
                audio_storage_path: audioPath,
            });
        }
        const { data, error: downloadError } = await supabase.storage
            .from("interview-recordings")
            .download(audioPath);

        if (downloadError || !data) {
            if (questionId) {
                await patchGenerationContext(supabase, questionId, { transcription_status: "failed" });
            }
            return new Response(
                JSON.stringify({ error: "Failed to download audio", details: downloadError }),
                { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
            );
        }
        audioBlob = data;
        resolvedFileName = audioPath.split("/").pop() ?? "audio.m4a";
    }

    try {
        const groqResponse = await transcribeWithRetry(
            audioBlob,
            Deno.env.get("GROQ_API_KEY") ?? "",
            resolvedFileName,
        );
        const result = await groqResponse.json();

        const text = extractText(result);
        if (!text) {
            if (questionId) {
                await patchGenerationContext(supabase, questionId, {
                    transcription_status: "failed",
                });
            }
            return new Response(
                JSON.stringify({
                    error: "Unexpected response format from Groq",
                    raw: result,
                }),
                {
                    status: 502,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                },
            );
        }

        const confidence = extractConfidence(result);

        if (questionId) {
            // 1. Update generation_context with completion status + whisper confidence
            await patchGenerationContext(supabase, questionId, {
                transcription_status: "completed",
                whisper_confidence: confidence,
            });

            // 2. Upsert the transcript text into application_answers
            //    Uses the UNIQUE constraint on question_id
            await supabase
                .from("application_answers")
                .upsert(
                    { question_id: questionId, answer_text: text },
                    { onConflict: "question_id" },
                );
        }

        return new Response(
            JSON.stringify({
                text,
                whisper_confidence: confidence,
                transcription_status: "completed",
            }),
            { headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
    } catch (err) {
        if (questionId) {
            await patchGenerationContext(supabase, questionId, {
                transcription_status: "failed",
            });
        }
        return new Response(
            JSON.stringify({ error: (err as Error).message }),
            {
                status: 502,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            },
        );
    }
});

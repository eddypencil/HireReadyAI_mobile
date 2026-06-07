import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
        "Content-Type, Authorization, x-client-info, apikey, x-region",
};

const HF_API_URL =
    "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

async function transcribeWithRetry(audioBlob: Blob, apiKey: string, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt < retries; attempt++) {
        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "audio/webm",
            },
            body: audioBlob,
        });

        if (response.ok) {
            return response;
        }

        const body = await response.json();

        if (
            response.status === 503 &&
            body.error?.toLowerCase().includes("model is loading")
        ) {
            const wait = body.estimated_time
                ? Math.min(body.estimated_time * 1000, 30000)
                : RETRY_DELAY_MS;
            await new Promise((r) => setTimeout(r, wait));
            continue;
        }

        throw new Error(
            `Hugging Face API error (${response.status}): ${JSON.stringify(body)}`,
        );
    }

    throw new Error("Max retries exceeded — model failed to load");
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

    // questionId is now application_questions.id
    const { audioPath, questionId } = await req.json();

    if (!audioPath) {
        return new Response(JSON.stringify({ error: "audioPath is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SB_SERVICE_KEY") ?? "",
    );

    // Mark as processing in generation_context
    if (questionId) {
        await patchGenerationContext(supabase, questionId, {
            transcription_status: "processing",
        });
    }

    // Download the audio from storage
    const { data: audioBlob, error: downloadError } = await supabase.storage
        .from("interview-recordings")
        .download(audioPath);

    if (downloadError || !audioBlob) {
        if (questionId) {
            await patchGenerationContext(supabase, questionId, {
                transcription_status: "failed",
            });
        }
        return new Response(
            JSON.stringify({
                error: "Failed to download audio",
                details: downloadError,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            },
        );
    }

    try {
        const hfResponse = await transcribeWithRetry(
            audioBlob,
            Deno.env.get("HUGGINGFACE_API_KEY") ?? "",
        );
        const result = await hfResponse.json();

        const text = extractText(result);
        if (!text) {
            if (questionId) {
                await patchGenerationContext(supabase, questionId, {
                    transcription_status: "failed",
                });
            }
            return new Response(
                JSON.stringify({
                    error: "Unexpected response format from Hugging Face",
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

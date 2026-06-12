import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_EMBED_URL = "https://router.huggingface.co/v1/embeddings";
const HF_CHAT_MODEL = "Qwen/Qwen2.5-7B-Instruct";
const HF_EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

async function embedTexts(texts: string[], apiKey: string): Promise<number[][]> {
  if (texts.length === 0) return [];
  const res = await fetch(HF_EMBED_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HF_EMBED_MODEL,
      input: texts,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Embedding error: ${JSON.stringify(err)}`);
  }
  const data = await res.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}

function clusterBySimilarity(
  items: string[],
  embeddings: number[][],
  threshold = 0.82,
): { theme: string; items: string[]; count: number }[] {
  if (items.length === 0) return [];
  const used = new Set<number>();
  const clusters: { theme: string; items: string[]; count: number }[] = [];

  for (let i = 0; i < items.length; i++) {
    if (used.has(i)) continue;
    const cluster = [i];
    used.add(i);
    for (let j = i + 1; j < items.length; j++) {
      if (used.has(j)) continue;
      if (cosineSimilarity(embeddings[i], embeddings[j]) >= threshold) {
        cluster.push(j);
        used.add(j);
      }
    }
    clusters.push({
      theme: items[cluster[0]],
      items: cluster.map(idx => items[idx]),
      count: cluster.length,
    });
  }

  return clusters.sort((a, b) => b.count - a.count);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const { jobId } = await req.json();
  if (!jobId) {
    return new Response(
      JSON.stringify({ error: "jobId is required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const apiKey = Deno.env.get("HUGGINGFACE_API_KEY_SHORTLIST") ?? "";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SB_SERVICE_KEY") ?? "",
  );

  // ── Fetch job details ──────────────────────────────────────────────────
  const { data: job, error: jobError } = await supabase
    .from("job_postings")
    .select("title, description, skills, requirements")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return new Response(
      JSON.stringify({ error: "Job not found", details: jobError }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // ── Fetch pipeline stages ──────────────────────────────────────────────
  const { data: stages } = await supabase
    .from("recruitment_stages")
    .select("id, name, stage_type, order_index")
    .eq("job_id", jobId)
    .order("order_index", { ascending: true });

  const shortlistStage = (stages || []).find(s => s.stage_type === "shortlist");
  const precedingStage = (stages || [])
    .filter(s => s.order_index < (shortlistStage?.order_index ?? 9999))
    .sort((a, b) => b.order_index - a.order_index)[0];

  const stagesList = (stages || []).map(s => s.name).join(" → ");

  // ── Fetch candidates in preceding stage ────────────────────────────────
  let candidateCount = 0;
  let averageScore = null;
  let commonStrengths: string[] = [];
  let commonWeaknesses: string[] = [];

  if (precedingStage) {
    const { data: appStages } = await supabase
      .from("application_stages")
      .select(`
        score,
        application_stage_evaluations ( ai_score, strengths, weaknesses )
      `)
      .eq("stage_id", precedingStage.id)
      .not("score", "is", null);

    if (appStages && appStages.length > 0) {
      candidateCount = appStages.length;
      const scores = appStages.map(s => Number(s.score ?? s.application_stage_evaluations?.[0]?.ai_score ?? 0));
      averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      const allStrengths: string[] = [];
      const allWeaknesses: string[] = [];
      for (const s of appStages) {
        const evalData = s.application_stage_evaluations?.[0];
        if (evalData?.strengths) allStrengths.push(...evalData.strengths);
        if (evalData?.weaknesses) allWeaknesses.push(...evalData.weaknesses);
      }

      // Embed and cluster strengths
      if (allStrengths.length > 0) {
        try {
          const embeds = await embedTexts(allStrengths, apiKey);
          const clusters = clusterBySimilarity(allStrengths, embeds);
          commonStrengths = clusters.slice(0, 5).map(
            c => `"${c.theme}" (${c.count}/${candidateCount} candidates)`
          );
        } catch {
          // Fallback: just show unique items
          const unique = [...new Set(allStrengths.map(s => s.toLowerCase()))];
          commonStrengths = unique.slice(0, 5).map(s => `"${s}"`);
        }
      }

      // Embed and cluster weaknesses
      if (allWeaknesses.length > 0) {
        try {
          const embeds = await embedTexts(allWeaknesses, apiKey);
          const clusters = clusterBySimilarity(allWeaknesses, embeds);
          commonWeaknesses = clusters.slice(0, 5).map(
            c => `"${c.theme}" (${c.count}/${candidateCount} candidates)`
          );
        } catch {
          const unique = [...new Set(allWeaknesses.map(w => w.toLowerCase()))];
          commonWeaknesses = unique.slice(0, 5).map(w => `"${w}"`);
        }
      }
    }
  }

  // ── Build prompt ───────────────────────────────────────────────────────
  const prompt = `You are a hiring expert. Given the following job posting and candidate pool, suggest evaluation criteria and a minimum score threshold for shortlisting candidates.

JOB POSTING:
Title: ${job.title}
Description: ${job.description}
Skills: ${(job.skills || []).join(", ")}
Requirements: ${(job.requirements || []).join("; ")}

PIPELINE STRUCTURE:
${stagesList}

CANDIDATE POOL (in the stage before shortlist):
- Number of candidates: ${candidateCount}
- Average score across all completed stages: ${averageScore != null ? `${averageScore}/100` : "N/A"}
- Most common strengths across the pool:
${commonStrengths.length > 0 ? commonStrengths.map(s => `  * ${s}`).join("\n") : "  (none recorded)"}
- Most common weaknesses across the pool:
${commonWeaknesses.length > 0 ? commonWeaknesses.map(w => `  * ${w}`).join("\n") : "  (none recorded)"}

Return ONLY a valid JSON object with exactly these fields, no extra text, no markdown, no code blocks:
{
  "criteria": "<3-5 sentence evaluation criteria for shortlisting. Describe what makes a strong candidate for this role and what the hiring team should prioritize. Be specific to this job and reference the current candidate pool.>",
  "suggestedMinScore": <integer 50-90, the recommended minimum score threshold>,
  "scoreReasoning": "<1-2 sentence explanation of why the suggested score was chosen given the candidate pool and job requirements>"
}`;

  const hfResponse = await fetch(HF_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HF_CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert hiring consultant. Always respond with valid JSON only. Never include markdown, code blocks, or any text outside the JSON object.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });

  if (!hfResponse.ok) {
    const errBody = await hfResponse.json();
    throw new Error(`HuggingFace error: ${JSON.stringify(errBody)}`);
  }

  const hfData = await hfResponse.json();
  let content = hfData.choices[0].message.content.trim();

  content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) content = jsonMatch[0];

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${content}`);
  }

  return new Response(
    JSON.stringify({
      criteria: parsed.criteria || "",
      suggestedMinScore: Math.max(50, Math.min(90, Math.round(parsed.suggestedMinScore ?? 70))),
      scoreReasoning: parsed.scoreReasoning || "",
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
});

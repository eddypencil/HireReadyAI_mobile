import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "Qwen/Qwen2.5-7B-Instruct";

async function evaluateCandidate(supabase, applicationId, evaluationCriteria, minScore) {
  // ── 1. Fetch application with job and stages ──────────────────────────
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select(`
      id,
      job_id,
      composite_score,
      cv_score,
      job_postings!inner (
        id,
        title,
        description,
        skills,
        requirements
      ),
      application_stages (
        id,
        stage_id,
        score,
        status,
        ai_feedback,
        recruitment_stages ( id, name, stage_type, order_index ),
        application_stage_evaluations ( ai_score, confidence, reasoning, recommendation, strengths, weaknesses )
      )
    `)
    .eq("id", applicationId)
    .single();

  if (appError || !application) {
    return { applicationId, error: "Application not found" };
  }

  const job = application.job_postings;

  // ── 2. Find the Shortlist stage for this job ──────────────────────────
  const { data: shortlistStage } = await supabase
    .from("recruitment_stages")
    .select("id")
    .eq("job_id", job.id)
    .eq("stage_type", "shortlist")
    .maybeSingle();

  if (!shortlistStage) {
    return { applicationId, error: "No Shortlist stage found for this job" };
  }

  // ── 3. Find or create the shortlist application_stage row ─────────────
  const { data: existingStage } = await supabase
    .from("application_stages")
    .select("id")
    .eq("application_id", applicationId)
    .eq("stage_id", shortlistStage.id)
    .maybeSingle();

  let shortlistApplicationStageId = existingStage?.id;

  if (!shortlistApplicationStageId) {
    const { data: newStage } = await supabase
      .from("application_stages")
      .insert({
        application_id: applicationId,
        stage_id: shortlistStage.id,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    shortlistApplicationStageId = newStage?.id;
  } else {
    await supabase
      .from("application_stages")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", shortlistApplicationStageId);
  }

  if (!shortlistApplicationStageId) {
    return { applicationId, error: "Failed to create shortlist stage row" };
  }

  // ── 4. Build stage history from stages that have a score ──────────────
  const completedStages = application.application_stages
    .filter(s => s.score != null)
    .sort((a, b) => (a.recruitment_stages?.order_index || 0) - (b.recruitment_stages?.order_index || 0));

  const stageHistoryText = completedStages.length > 0
    ? completedStages.map(s => {
        const evalData = s.application_stage_evaluations?.[0];
        const parts = [
          `Stage: ${s.recruitment_stages?.name || "Unknown"} (${(s.recruitment_stages?.stage_type || "").replace(/_/g, " ")})`,
          `Score: ${Math.round(Number(s.score))}/100`,
          `Status: ${s.status}`,
        ];
        if (evalData?.reasoning) parts.push(`Reasoning: ${evalData.reasoning}`);
        if (evalData?.strengths?.length > 0) parts.push(`Strengths: ${evalData.strengths.join("; ")}`);
        if (evalData?.weaknesses?.length > 0) parts.push(`Weaknesses: ${evalData.weaknesses.join("; ")}`);
        return parts.join("\n");
      }).join("\n\n")
    : "No completed stages with scores available.";

  // ── 5. Build prompt ──────────────────────────────────────────────────
  const prompt = `You are a strict hiring evaluator. Your job is to decide whether a candidate should advance to the shortlist based on evaluation criteria and their performance across all previous stages.

JOB POSTING:
Title: ${job.title}
Description: ${job.description}
Skills: ${(job.skills || []).join(", ")}
Requirements: ${(job.requirements || []).join("; ")}

EVALUATION CRITERIA (provided by the hiring team — follow these FIRST and foremost):
${evaluationCriteria}

MINIMUM SCORE THRESHOLD: ${minScore}/100

STAGE HISTORY (all completed stages with scores and feedback):
${stageHistoryText}

INSTRUCTIONS:
1. Score the candidate SOLELY on their stage history below — evaluate their actual performance, strengths, and weaknesses across all completed stages. The evaluation criteria provided by the hiring team only controls the recommendation decision, NOT the score.
2. The overall "score" (0-100) must reflect the candidate's demonstrated ability in their completed stages. Do NOT let the evaluation criteria influence the score itself.
3. The evaluation criteria should ONLY influence the "recommendation" field (proceed/reject) and whether to advance the candidate. Do NOT reference or quote the evaluation criteria in your reasoning, feedback, strengths, or weaknesses.
4. After scoring, check the candidate's score against the minimum threshold of ${minScore}/100.
5. Consider the reasoning, strengths, and weaknesses from previous stages as supporting evidence.
6. A "proceed" recommendation means the candidate should advance to shortlist.
7. A "reject" recommendation means the candidate should not advance.
8. Be honest and critical. Base everything on the candidate's actual performance data.

Return ONLY a valid JSON object with exactly these fields, no extra text, no markdown, no code blocks:
{
  "score": <integer 0-100, overall assessment score>,
  "recommendation": "<proceed | reject>",
  "reasoning": "<3-5 sentence detailed explanation of why the candidate should or should not advance, referencing the criteria and stage history>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "tags": ["<1-2 word descriptor>", "<1-2 word descriptor>"]
}

TAGS GUIDELINES:
- Each tag must be 1-2 words only.
- At least 1 tag, maximum 3 tags.
- Tags summarize key takeaways about the candidate (e.g. "Strong technical", "Good culture fit", "Missing experience", "Great communicator", "Overqualified", "High potential").
- Be concise and informative — these tags will appear directly in the shortlist UI.`;

  // ── 6. Call HuggingFace Qwen ─────────────────────────────────────────
  const hfResponse = await fetch(HF_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("HUGGINGFACE_API_KEY_SHORTLIST") ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert hiring evaluator. Always respond with valid JSON only. Never include markdown, code blocks, or any text outside the JSON object.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.3,
      logprobs: true,
    }),
  });

  if (!hfResponse.ok) {
    const errBody = await hfResponse.json();
    throw new Error(`HuggingFace error for ${applicationId}: ${JSON.stringify(errBody)}`);
  }

  const hfData = await hfResponse.json();
  let content = hfData.choices[0].message.content.trim();

  let modelConfidence = 0.5;
  const logprobsData = hfData.choices[0].logprobs;
  if (logprobsData?.content) {
    const tokenProbs = logprobsData.content
      .map((t) => Math.exp(t.logprob))
      .filter((p) => p > 0 && p <= 1);
    if (tokenProbs.length > 0) {
      modelConfidence = tokenProbs.reduce((a, b) => a + b, 0) / tokenProbs.length;
    }
  }

  content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) content = jsonMatch[0];

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Failed to parse AI response as JSON for ${applicationId}: ${content}`);
  }

  const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));
  const recommendation = parsed.recommendation === "proceed" ? "proceed" : "reject";
  const passed = recommendation === "proceed" && score >= minScore;

  // ── 7. Write results back to DB ───────────────────────────────────────
  const feedbackJson = JSON.stringify({
    reasoning: parsed.reasoning,
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    recommendation,
  });

  await supabase
    .from("application_stages")
    .update({
      score,
      ai_feedback: feedbackJson,
      status: passed ? "passed" : "failed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", shortlistApplicationStageId);

  await supabase.from("application_stage_evaluations").upsert(
    {
      application_stage_id: shortlistApplicationStageId,
      ai_score: score,
      confidence: modelConfidence,
      reasoning: parsed.reasoning || "",
      recommendation,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
    },
    { onConflict: "application_stage_id" }
  );

  await supabase
    .from("applications")
    .update({
      composite_score: score,
      ai_rationale: parsed.reasoning || null,
      ai_confidence: modelConfidence,
    })
    .eq("id", applicationId);

  const tags = Array.isArray(parsed.tags) ? parsed.tags.filter(t => typeof t === "string" && t.trim()) : [];

  // ── 8. If passed, advance to shortlist ────────────────────────────────
  if (passed) {
    await supabase
      .from("applications")
      .update({ current_stage_id: shortlistStage.id })
      .eq("id", applicationId);

    const { error: insertError } = await supabase
      .from("shortlist_entries")
      .insert({
        job_id: job.id,
        application_id: applicationId,
        tags,
      });

    if (insertError && insertError.code !== "23505") {
      console.error("Failed to add to shortlist_entries:", insertError);
    }
  }

  return {
    applicationId,
    jobId: job.id,
    score,
    recommendation,
    passed,
    reasoning: parsed.reasoning,
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    tags,
    confidence: modelConfidence,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const { applicationIds, evaluationCriteria, minScore } = await req.json();
  if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0 || !evaluationCriteria || minScore == null) {
    return new Response(
      JSON.stringify({ error: "applicationIds (non-empty array), evaluationCriteria, and minScore are required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SB_SERVICE_KEY") ?? "",
  );

  const results = [];

  for (const appId of applicationIds) {
    try {
      const result = await evaluateCandidate(supabase, appId, evaluationCriteria, minScore);
      results.push(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Shortlist evaluation failed for", appId, ":", msg);
      results.push({ applicationId: appId, error: msg });
    }
  }

  // Re-rank ALL shortlist entries per job (including pre-existing ones)
  const jobIds = [...new Set(results.map(r => r.jobId).filter(Boolean))];
  for (const jobId of jobIds) {
    const { data: entries } = await supabase
      .from("shortlist_entries")
      .select("application_id")
      .eq("job_id", jobId);

    if (!entries || entries.length === 0) continue;

    const appIds = entries.map(e => e.application_id);
    const { data: apps } = await supabase
      .from("applications")
      .select("id, composite_score")
      .in("id", appIds);

    if (!apps) continue;

    const scoreMap = new Map(apps.map(a => [a.id, a.composite_score ?? 0]));
    const ranked = entries
      .map(e => ({ application_id: e.application_id, score: scoreMap.get(e.application_id) ?? 0 }))
      .sort((a, b) => b.score - a.score);

    for (let i = 0; i < ranked.length; i++) {
      await supabase
        .from("shortlist_entries")
        .update({ rank: i + 1 })
        .eq("application_id", ranked[i].application_id)
        .eq("job_id", jobId);
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
});

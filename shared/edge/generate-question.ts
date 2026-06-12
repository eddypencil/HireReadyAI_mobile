import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "Qwen/Qwen2.5-7B-Instruct";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviousAnswer {
  questionId: string;
  answerText: string;
  timeTaken?: number; // seconds
}

interface AnswerEvaluation {
  score: number;
  feedback: string;
  detailed_points: Array<{
    point: string;
    score_impact: number;
    type: "strength" | "weakness";
  }>;
  strengths: string[];
  weaknesses: string[];
}

interface NextQuestion {
  text: string;
  type: "video" | "text" | "multiple_choice" | "code";
  code_type?: "visuals" | "problem_solving" | null;
  options: string[] | null;
  language: string | null;
  max_time: number | null; // seconds
}

interface SessionSummary {
  overall_score: number;
  recommendation: string;
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
}

interface AIOutput {
  answer_evaluation: AnswerEvaluation | null;
  next_question: NextQuestion | null;
  is_final: boolean;
  session_summary: SessionSummary | null;
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildPrompt(params: {
  stageName: string;
  stageType: string;
  stageDescription: string;
  evaluationCriteria: Record<string, unknown>;
  jobTitle: string;
  jobSeniority: string;
  jobSkills: string[];
  jobRequirements: string[];
  cvScore: number | null;
  history: Array<{
    question_text: string;
    question_type: string;
    answer_text: string | null;
    score: number | null;
  }>;
  typeConstraint: string;
  previousAnswerText: string | null;
  previousQuestionText: string | null;
  nextQuestionNumber: number;
  maxQuestions: number;
  isFinalQuestion: boolean;
  isSessionOver: boolean;
}): string {
  const {
    stageName, stageType, stageDescription, evaluationCriteria,
    jobTitle, jobSeniority, jobSkills, jobRequirements, cvScore,
    history, previousAnswerText, previousQuestionText,
    nextQuestionNumber, maxQuestions, isFinalQuestion, isSessionOver,typeConstraint
  } = params;

  const questionTypeGuide = stageType === "hr_interview"
  ? `FORMAT CONSTRAINTS — HR INTERVIEW:
- DEFAULT to "video" for all behavioral, motivational, situational, and self-reflection questions
- Use "text" ONLY for written exercises (e.g., "Write a short response to a client complaint")
- Use "multiple_choice" ONLY for policy/compliance knowledge checks
- NEVER use "code" in HR interviews
- The SUBJECT of questions is determined by the stage Name and Purpose below, NOT by this type alone
- The "multiple_choice" can either be scored 0 or 100 nothing between`

  : stageType === "technical_interview"
  ? `FORMAT CONSTRAINTS — TECHNICAL INTERVIEW:
- Use "video" for: system design walkthroughs, architecture decisions, past project deep-dives, trade-off discussions
- Use "text" for: short written explanations (under 3 sentences), debugging analysis without code
- Use "code" for: algorithm implementation, fix-the-bug tasks, write-a-function tasks, or UI component implementation
  * If the question relates to UI, frontend layout, HTML, CSS, React, or their equivalents from other languages, set "code_type" to "visuals".
  * If the question involves algorithms, backend logic, data structures, or general problem-solving, set "code_type" to "problem_solving and doesn't include any visual renders example (given an array get the first 5 even numbers, given 2 strings return true if anagrams false if not)".
- Use "multiple_choice" for: specific API knowledge, language syntax checks, tool/library familiarity
- The "multiple_choice" can either be scored 0 or 100 nothing between
- BIAS toward "video" and "code". Avoid "text" unless neither fits.
- The SUBJECT of questions is determined by the stage Name and Purpose below, NOT by this type alone`

  : `FORMAT CONSTRAINTS — ASSESSMENT:
- NEVER use "video"
- Use "multiple_choice", "code", or "text" as appropriate for the question
- The SUBJECT of questions is determined by the stage Name and Purpose below, NOT by this type`;

  const stageGuidance: Record<string, string> = {
    hr_interview:
      "Behavioral/cultural-fit interview. Focus on culture, motivation, and values. However, the stage Name and Purpose below may specialize this (e.g., 'Technical Leadership Interview' should include technical judgment questions). Always follow Name and Purpose as the primary directive.",
    technical_interview:
      "Technical depth interview. Focus on problem-solving, system design, and technical knowledge. However, the stage Name and Purpose below may specialize this (e.g., 'Frontend Architecture Interview' should focus on frontend). Always follow Name and Purpose as the primary directive.",
    assessment_test:
      "Custom assessment. The stage Name and Purpose below define exactly what subject to test — follow them strictly.",
    assessment:
      "Skills assessment. The stage Name and Purpose below define what skill to assess — follow them strictly.",
  };
  const guidance = stageGuidance[stageType] || "The stage Name and Purpose below define what to test — follow them as the primary directive.";

  const historyText = history.length > 0
    ? history.map((q, i) => {
        const ans = q.answer_text
        ? (i >= history.length - 3
            ? (q.answer_text.length > 800 ? q.answer_text.slice(0, 800) + "…" : q.answer_text)
            : q.answer_text.slice(0, 200) + (q.answer_text.length > 200 ? "…" : ""))
        : "[No answer]";
        const score = q.score != null ? ` | Score: ${q.score}/100` : "";
        return `Q${i + 1} (${q.question_type}): "${q.question_text}"\nA${i + 1}: "${ans}"${score}`;
      }).join("\n\n")
    : "No questions asked yet.";
  
  const codeQuestionsSoFar = history
  .filter(q => q.question_type === "code")
  .map((q, i) => `- Q${i + 1}: "${q.question_text}"`)
  .join("\n");

    const codeRepetitionGuard = codeQuestionsSoFar.length > 0
      ? `=== CODE QUESTIONS ALREADY ASKED ===
    ${codeQuestionsSoFar}

    STRICT RULE: The next code question MUST:
    1. Test a completely different concept/pattern than all questions above
    2. NOT be a variation or extension of any previous code question
    3. NOT reuse the same data structure theme (e.g. if arrays were used twice, switch to strings, trees, maps, etc.)
    4. NOT increase complexity of a problem already asked — that is considered a duplicate`
      : "";

  const answerSection = previousAnswerText
    ? `\n=== CURRENT ANSWER TO EVALUATE ===\nQuestion: "${previousQuestionText}"\nCandidate's Answer: "${previousAnswerText.slice(0, 2000)}"\n`
    : "";
  
  let taskText: string;
  if (isSessionOver) {
    taskText = `=== TASK ===
STEP 1: Evaluate the final answer above.
STEP 2: Compute the OVERALL SESSION SUMMARY for all ${history.length + 1} questions answered.
Set "is_final": true and "next_question": null.
Weigh the scores across all questions. Consider the stage's pass_score context when forming recommendation.`;
  } else if (isFinalQuestion) {
    taskText = `=== TASK ===
${previousAnswerText ? "STEP 1: Evaluate the answer above.\nSTEP 2: Generate" : "Generate"} the FINAL question (Question ${nextQuestionNumber} of ${maxQuestions}).
The final question should cover any remaining significant competency gaps. Make it comprehensive.`;
  } else {
    taskText = `=== TASK ===
${previousAnswerText ? `STEP 1: Evaluate the answer above.\nSTEP 2: Generate Question ${nextQuestionNumber} of ${maxQuestions}.` : `Generate Question ${nextQuestionNumber} of ${maxQuestions}.`}`;
  }

  return `You are a strict AI interviewer. You are conducting a "${stageName}" stage.

=== OVERRIDING DIRECTIVE — READ FIRST ===
The stage Name and Purpose below are the PRIMARY definition of what this test is about. They override any default assumptions based on stage type. Generate questions that match the Name and Purpose above all else.

STRICT RULES — NEVER BREAK THESE:
1. Be completely neutral: zero hints, zero encouragement, zero positive reinforcement
2. Never say "Great!", "Interesting!", "Good point!" or anything evaluative
3. Never reference or paraphrase the candidate's previous answers in a new question
4. Never ask leading questions that telegraph the correct answer
5. Probe weaknesses directly and without signaling what is missing
6. Questions must be clear, direct, and professional
7. NEVER repeat a question — each new question must test a different concept from ALL previous questions. Check the INTERVIEW HISTORY to ensure no overlap in topic, concept, or skill tested.
8. The "multiple_choice" can either be scored 0 or 100 nothing between
=== JOB CONTEXT ===
Position: ${jobTitle}${jobSeniority ? ` (${jobSeniority})` : ""}
Required Skills: ${jobSkills?.join(", ") || "Not specified"}
Requirements: ${jobRequirements?.join("; ") || "Not specified"}

=== STAGE CONTEXT (THIS IS WHAT DEFINES THE TEST) ===
Name: ${stageName}
Purpose: ${stageDescription || "Evaluate candidate fit for the role"}
Type (format constraints only): ${stageType || "interview"}
Evaluation Criteria: ${JSON.stringify(evaluationCriteria)}
Guidance: ${guidance}
Candidate CV Score: ${cvScore != null ? `${cvScore}/100` : "Unknown"}

=== INTERVIEW HISTORY ===
${historyText}
${answerSection}
${taskText}
${questionTypeGuide}
${codeRepetitionGuard}
${typeConstraint}
Return ONLY a valid JSON object (no | null annotations, no markdown, no extra text):
{
  "answer_evaluation": null,
  "next_question": null,
  "is_final": false,
  "session_summary": null
}

Field specifications (set each to null when not applicable):
- "answer_evaluation": { "score": <0-100>, "feedback": "<2-3 sentence internal assessment>", "detailed_points": [{ "point": "<specific aspect>", "score_impact": <integer, positive or negative, e.g. +10 or -5>, "type": "strength"|"weakness" }], "strengths": ["..."], "weaknesses": ["..."] }
- "next_question": { "text": "<exact question text, direct and neutral>", "type": "video"|"text"|"multiple_choice"|"code", "code_type": "visuals"|"problem_solving"|null, "options": ["<A>","<B>","<C>","<D>"]|null, "language": "javascript"|"python"|"java"|null, "max_time": <integer seconds, e.g. 60-600>|null }
- "session_summary": { "overall_score": <0-100>, "recommendation": "proceed"|"review"|"reject", "reasoning": "<3-4 sentence assessment>", "strengths": ["..."], "weaknesses": ["..."] }`;
}


// ─── HuggingFace caller ───────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<AIOutput> {
  const response = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("HUGGINGFACE_API_KEY_INTERVIEW") ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a strict AI interviewer. Always respond with valid JSON only. Never include markdown, code blocks, or any text outside the JSON object. The stage Name and Purpose in the user prompt define the test subject — follow them as the highest priority.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.65,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`HuggingFace error: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  let content: string = data.choices[0].message.content.trim();
  content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  const match = content.match(/\{[\s\S]*\}/);
  if (match) content = match[0];

  try {
    // The AI sometimes outputs "+5" for positive score_impact values.
    // Leading + is invalid JSON — strip it before parsing.
    let sanitized = content.replace(/:\s*\+(\d+)/g, ": $1");
    // Strip stray TypeScript union type annotations like | null, | "foo" etc.
    sanitized = sanitized.replace(/\s*\|\s*(null|"[^"]*"|'[^']*')\s*/g, "");
    return JSON.parse(sanitized) as AIOutput;
  } catch {
    throw new Error(`Failed to parse AI response: ${content}`);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const { applicationStageId, previousAnswer } = (await req.json()) as {
    applicationStageId: string;
    previousAnswer?: PreviousAnswer | null;
  };

  if (!applicationStageId) {
    return new Response(
      JSON.stringify({ error: "applicationStageId is required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SB_SERVICE_KEY") ?? "",
  );

  // ── 1. Fetch stage context ─────────────────────────────────────────────────
  const { data: stageData, error: stageError } = await supabase
    .from("application_stages")
    .select(`
      id, status,
      recruitment_stages!inner (
        id, name, description, stage_type, pass_score, evaluation_criteria, order_index, num_questions
      ),
      applications!inner (
        id, cv_score, answers, job_id,
        job_postings!inner (
          title, seniority_level, description, skills, requirements
        )
      )
    `)
    .eq("id", applicationStageId)
    .single();

  if (stageError || !stageData) {
    return new Response(
      JSON.stringify({ error: "Stage not found", details: stageError }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const stage = stageData.recruitment_stages as {
    id: string; name: string; description: string; stage_type: string;
    pass_score: number | null; evaluation_criteria: Record<string, unknown> | null;
    order_index: number; num_questions: number | null;
  };
  const application = stageData.applications as {
    id: string; cv_score: number | null; answers: Record<string, unknown> | null; job_id: string;
    job_postings: { title: string; seniority_level: string; skills: string[]; requirements: string[]; };
  };
  const job = application.job_postings;

  // Use num_questions from recruitment_stages, fallback to max_questions in evaluation_criteria, then fallback to 8
  const maxQuestions: number = stage.num_questions ?? ((stage.evaluation_criteria?.max_questions as number) ?? 8);

  // ── 2. Save the incoming answer FIRST so history count is accurate ──────────
  // We save the answer before fetching history so that answeredInDB reflects
  // the true answered count (including the answer we just received).
  if (previousAnswer?.questionId && previousAnswer?.answerText) {
    // Partial upsert — score/feedback will be filled in after AI evaluation below
    await supabase.from("application_answers").upsert(
      {
        question_id: previousAnswer.questionId,
        answer_text: previousAnswer.answerText,
      },
      { onConflict: "question_id" }
    );
  }

  // ── 3. Fetch question history (now includes the just-saved answer) ──────────
  const { data: rawHistory } = await supabase
    .from("application_questions")
    .select(`
      id, question_text, question_type, order_index, generation_context,
      application_answers ( answer_text, score, feedback )
    `)
    .eq("application_stage_id", applicationStageId)
    .order("order_index", { ascending: true });

  // Normalise application_answers — Supabase may return object or array
  const pickAnswer = (raw: unknown) => {
    if (!raw) return { answer_text: null, score: null };
    if (Array.isArray(raw)) {
      const first = (raw as Record<string, unknown>[])[0] ?? {};
      return { answer_text: (first.answer_text as string) ?? null, score: (first.score as number) ?? null };
    }
    const obj = raw as Record<string, unknown>;
    return { answer_text: (obj.answer_text as string) ?? null, score: (obj.score as number) ?? null };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const history = (rawHistory ?? []).map((q: any) => {
    const { answer_text, score } = pickAnswer(q.application_answers);
    return {
      id: q.id as string,
      question_text: q.question_text as string,
      question_type: q.question_type as string,
      order_index: q.order_index as number,
      generation_context: q.generation_context,
      answer_text,
      score,
    };
  });

  // Named type to avoid 'typeof history[0]' which Deno's TS rejects as a generic arg
  type HistoryRow = {
    id: string; question_text: string; question_type: string;
    order_index: number; generation_context: unknown;
    answer_text: string | null; score: number | null;
  };

  // Deduplicate by order_index — the DB may have duplicate rows per slot from
  // previous broken sessions. For each slot keep the "best" row:
  //   1. A row with an answer + score   (fully evaluated)
  //   2. A row with an answer only      (saved but not yet scored)
  //   3. A row with no answer           (unanswered — last resort)
  const slotMap = new Map<number, HistoryRow>();
  for (const q of history) {
    const existing = slotMap.get(q.order_index);
    if (!existing) {
      slotMap.set(q.order_index, q);
    } else {
      // Prefer answered over unanswered; prefer scored over unscored
      const qScore   = q.answer_text != null ? (q.score != null ? 2 : 1) : 0;
      const exScore  = existing.answer_text != null ? (existing.score != null ? 2 : 1) : 0;
      if (qScore > exScore) slotMap.set(q.order_index, q);
    }
  }
  const deduped = Array.from(slotMap.values()).sort((a, b) => a.order_index - b.order_index);

  // Answered = unique slots that have a non-null answer_text
  const answeredInDB = deduped.filter((q) => q.answer_text != null).length;
  const nextQuestionNumber = answeredInDB + 1;
  const isFinalQuestion = answeredInDB === maxQuestions - 1;
  const isSessionOver = answeredInDB >= maxQuestions;

  // ── 4. Find the text of the previous question for prompt context ────────────
  let previousQuestionText: string | null = null;
  if (previousAnswer?.questionId) {
    const prevQ = history.find((q) => q.id === previousAnswer.questionId);
    previousQuestionText = prevQ?.question_text ?? null;
  }

  const usedTypes = deduped.map(q => q.question_type);
  const typeCounts = usedTypes.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeConstraint = `
  QUESTION TYPE DISTRIBUTION (so far): ${JSON.stringify(typeCounts)}
  RULE: Do not use the same type more than ${Math.ceil(maxQuestions / 3)} times in one session.
  If "text" has been used ${typeCounts["text"] >= 2 ? "2+ times" : "already"}, pick a different type.`;


  // ── 5. Call AI ────────────────────────────────────────────────────────────
  // DEBUG: log deduped history so we can trace question progression cleanly
  console.log("=== generate-question DEBUG ===");
  console.log("applicationStageId:", applicationStageId);
  console.log("previousAnswer:", previousAnswer ?? "(none — first question)");
  console.log("raw rows in DB:", history.length, "| deduped slots:", deduped.length);
  console.log("answeredInDB:", answeredInDB, "| nextQuestionNumber:", nextQuestionNumber, "| maxQuestions:", maxQuestions);
  console.log("isSessionOver:", isSessionOver, "| isFinalQuestion:", isFinalQuestion);
  console.log("deduped history:");
  deduped.forEach((q, i) => {
    console.log(
      `  Q${i + 1} [order_index=${q.order_index}] id=${q.id}`,
      `| type=${q.question_type}`,
      `| answered=${q.answer_text != null}`,
      `| score=${q.score ?? "—"}`,
      `| text="${q.question_text?.slice(0, 80)}${q.question_text?.length > 80 ? "…" : ""}"`
    );
  });
  console.log("================================");
  let aiResult: AIOutput;
  try {
    const prompt = buildPrompt({
      stageName: stage.name,
      stageType: stage.stage_type,
      stageDescription: stage.description,
      evaluationCriteria: stage.evaluation_criteria ?? {},
      jobTitle: job.title,
      jobSeniority: job.seniority_level,
      jobSkills: job.skills ?? [],
      jobRequirements: job.requirements ?? [],
      cvScore: application.cv_score,
      history: deduped.map((q) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        answer_text: q.answer_text,
        score: q.score,
      })),
      typeConstraint:typeConstraint,
      previousAnswerText: previousAnswer?.answerText ?? null,
      previousQuestionText,
      nextQuestionNumber,
      maxQuestions,
      isFinalQuestion,
      isSessionOver,
    });

    aiResult = await callAI(prompt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: `AI call failed: ${msg}` }),
      { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // ── 6. Update answer evaluation score + feedback (partial upsert was done earlier) ──
  if (previousAnswer?.questionId && aiResult.answer_evaluation) {
    const { score, feedback, strengths, weaknesses } = aiResult.answer_evaluation;
    await supabase.from("application_answers").upsert(
      {
        question_id: previousAnswer.questionId,
        answer_text: previousAnswer.answerText,
        score,
        feedback: feedback,
        strengths: strengths || [],
        weaknesses: weaknesses || [],
      },
      { onConflict: "question_id" }
    );
  }

  // ── 7. Session over — save evaluation ─────────────────────────────────────
  const shouldFinalize = isSessionOver || aiResult.is_final;

  if (shouldFinalize) {
    // Compute stage score as the average of all individually scored questions
    const scoredQuestions = deduped.filter((q) => q.score != null);
    const avgScore = scoredQuestions.length > 0
      ? Math.round(scoredQuestions.reduce((sum, q) => sum + (q.score ?? 0), 0) / scoredQuestions.length)
      : (aiResult.answer_evaluation?.score ?? 0);

    const summary = aiResult.session_summary || {
      overall_score: avgScore,
      recommendation: "review",
      reasoning: "Session concluded automatically. AI failed to generate a proper summary.",
      strengths: [],
      weaknesses: [],
    };

    const { recommendation, reasoning, strengths, weaknesses } = summary;
    const overall_score = avgScore;

    await supabase.from("application_stage_evaluations").upsert(
      {
        application_stage_id: applicationStageId,
        ai_score: overall_score,
        recommendation,
        reasoning,
        strengths: strengths || [],
        weaknesses: weaknesses || [],
        confidence: 0.8,
      },
      { onConflict: "application_stage_id" }
    );

    // Update stage status based on pass_score
    const passScore = stage.pass_score ?? 55;
    const stagePassed = overall_score >= passScore;
    await supabase
      .from("application_stages")
      .update({ status: stagePassed ? "passed" : "failed", score: overall_score, completed_at: new Date().toISOString() })
      .eq("id", applicationStageId);

    return new Response(
      JSON.stringify({
        question: null,
        answerEvaluation: aiResult.answer_evaluation,
        isFinal: true,
        stageSummary: summary,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // ── 8. Save new question (with duplicate guard) ───────────────────────────
  if (!aiResult.next_question) {
    return new Response(
      JSON.stringify({ error: "AI did not return a next question" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Guard: if a question with this order_index already exists (deduped), return it
  // (prevents duplicate questions when the user re-submits the same answer)
  const existingAtIndex = deduped.find((q) => q.order_index === nextQuestionNumber);
  if (existingAtIndex && existingAtIndex.answer_text == null) {
    // An unanswered question already exists at this slot — return it instead
    return new Response(
      JSON.stringify({
        question: {
          id: existingAtIndex.id,
          text: existingAtIndex.question_text,
          type: existingAtIndex.question_type,
          options: existingAtIndex.generation_context?.options ?? null,
          language: existingAtIndex.generation_context?.language ?? null,
          codeType: existingAtIndex.generation_context?.code_type ?? null,
          maxTime: existingAtIndex.generation_context?.max_time ?? null,
          orderIndex: existingAtIndex.order_index,
        },
        answerEvaluation: aiResult.answer_evaluation,
        isFinal: false,
        stageSummary: null,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const { data: newQuestion, error: insertError } = await supabase
    .from("application_questions")
    .insert({
      application_stage_id: applicationStageId,
      question_text: aiResult.next_question.text,
      question_type: aiResult.next_question.type,
      generated_by_ai: true,
      generation_context: {
        options: aiResult.next_question.options ?? null,
        language: aiResult.next_question.language ?? null,
        code_type: aiResult.next_question.code_type ?? null,
        max_time: aiResult.next_question.max_time ?? null,
      },
      order_index: nextQuestionNumber,
      generation_version: 1,
    })
    .select()
    .single();

  if (insertError || !newQuestion) {
    return new Response(
      JSON.stringify({ error: "Failed to save question", details: insertError }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  return new Response(
    JSON.stringify({
      question: {
        id: newQuestion.id,
        text: aiResult.next_question.text,
        type: aiResult.next_question.type,
        options: aiResult.next_question.options ?? null,
        language: aiResult.next_question.language ?? null,
        codeType: aiResult.next_question.code_type ?? null,
        maxTime: aiResult.next_question.max_time ?? null,
        orderIndex: nextQuestionNumber,
      },
      answerEvaluation: aiResult.answer_evaluation,
      isFinal: false,
      stageSummary: null,
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
});

import { supabase } from "../../../shared/services/supabase";

const INTERVIEW_STAGE_TYPES = [
  "assessment_test",
  "coding_test",
  "video_interview",
  "technical_interview",
  "hr_interview",
  "manager_interview",
  "ai_screening",
];

export const fetchActiveInterviewStage = async (applicationId) => {
  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("current_stage_id")
    .eq("id", applicationId)
    .single();
  if (appError) throw appError;
  if (!app?.current_stage_id) return null;

  const { data: recStage, error: recError } = await supabase
    .from("recruitment_stages")
    .select("id, stage_type")
    .eq("id", app.current_stage_id)
    .single();
  if (recError) throw recError;
  if (!recStage || !INTERVIEW_STAGE_TYPES.includes(recStage.stage_type)) return null;

  const { data: existing, error: findError } = await supabase
    .from("application_stages")
    .select(`
      id,
      recruitment_stages!inner (
        id, name, description, stage_type, pass_score, evaluation_criteria, order_index
      )
    `)
    .eq("application_id", applicationId)
    .eq("stage_id", app.current_stage_id)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("application_stages")
    .upsert(
      { application_id: applicationId, stage_id: app.current_stage_id },
      { onConflict: "application_id,stage_id" },
    )
    .select(`
      id,
      recruitment_stages!inner (
        id, name, description, stage_type, pass_score, evaluation_criteria, order_index
      )
    `)
    .single();
  if (createError) throw createError;
  return created;
};

export const fetchStageQuestions = async (applicationStageId) => {
  const { data, error } = await supabase
    .from("application_questions")
    .select(`
      id, question_text, question_type, order_index, generation_context,
      application_answers ( answer_text, score, feedback )
    `)
    .eq("application_stage_id", applicationStageId)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const generateNextQuestion = async (applicationStageId, previousAnswer = null) => {
  const { data, error } = await supabase.functions.invoke("generate-question-v2", {
    body: { applicationStageId, previousAnswer },
  });

  if (error) {
    let detail = error.message;
    try {
      const body = await error.context?.json?.();
      detail = JSON.stringify(body ?? detail);
    } catch { /* ignore */ }
    throw new Error(`Interview AI error: ${detail}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
};

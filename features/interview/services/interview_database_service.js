import { supabase } from "../../../shared/services/supabase";

export const fetchInterviewStageByApplicationId = async (applicationId) => {
  const { data, error } = await supabase
    .from("application_stages")
    .select(`
      *,
      recruitment_stages!inner (
        id, name, stage_type, job_id, description
      ),
      applications (
        id, candidate_profile_id, composite_score
      )
    `)
    .eq("application_id", applicationId)
    .eq("recruitment_stages.stage_type", "interview")
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateApplicationStageStatus = async (applicationStageId, updates) => {
  const { data, error } = await supabase
    .from("application_stages")
    .update(updates)
    .eq("id", applicationStageId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const fetchQuestionsByApplicationStageId = async (applicationStageId) => {
  const { data, error } = await supabase
    .from("application_questions")
    .select(`
      *,
      application_answers (
        id, answer_text, score, feedback, created_at
      )
    `)
    .eq("application_stage_id", applicationStageId)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data;
};

export const fetchApplicationQuestionById = async (questionId) => {
  const { data, error } = await supabase
    .from("application_questions")
    .select(`
      *,
      application_answers (*)
    `)
    .eq("id", questionId)
    .single();
  if (error) throw error;
  return data;
};

export const createApplicationQuestion = async (questionData) => {
  const { data, error } = await supabase
    .from("application_questions")
    .insert([questionData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const bulkCreateApplicationQuestions = async (questionsData) => {
  const { data, error } = await supabase
    .from("application_questions")
    .insert(questionsData)
    .select();
  if (error) throw error;
  return data;
};

export const updateApplicationQuestion = async (questionId, updates) => {
  const { data, error } = await supabase
    .from("application_questions")
    .update(updates)
    .eq("id", questionId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteApplicationQuestion = async (questionId) => {
  const { error } = await supabase
    .from("application_questions")
    .delete()
    .eq("id", questionId);
  if (error) throw error;
};

export const upsertApplicationAnswer = async (questionId, answerText, extra = {}) => {
  const { data, error } = await supabase
    .from("application_answers")
    .upsert(
      { question_id: questionId, answer_text: answerText, ...extra },
      { onConflict: "question_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const fetchAnswerByQuestionId = async (questionId) => {
  const { data, error } = await supabase
    .from("application_answers")
    .select("*")
    .eq("question_id", questionId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertStageEvaluation = async (applicationStageId, evalData) => {
  const { data, error } = await supabase
    .from("application_stage_evaluations")
    .upsert(
      { application_stage_id: applicationStageId, ...evalData },
      { onConflict: "application_stage_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const fetchStageEvaluation = async (applicationStageId) => {
  const { data, error } = await supabase
    .from("application_stage_evaluations")
    .select("*")
    .eq("application_stage_id", applicationStageId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

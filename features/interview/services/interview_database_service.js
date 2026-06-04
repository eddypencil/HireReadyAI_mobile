import { supabase } from "../../../shared/services/supabase";

// ─── Interviews ──────────────────────────────────────────────

export const fetchInterviewById = async (interviewId) => {
  const { data, error } = await supabase
    .from("interviews")
    .select(`
      *,
      applications (
        id,
        candidate_profile_id,
        current_stage,
        composite_score
      )
    `)
    .eq("id", interviewId)
    .single();
  if (error) throw error;
  return data;
};

export const fetchInterviewByApplicationId = async (applicationId) => {
  const { data, error } = await supabase
    .from("interviews")
    .select(`
      *,
      applications (
        id,
        candidate_profile_id,
        current_stage,
        composite_score
      )
    `)
    .eq("application_id", applicationId)
    .single();
  if (error) throw error;
  return data;
};

export const createInterview = async (interviewData) => {
  const { data, error } = await supabase
    .from("interviews")
    .insert([interviewData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateInterview = async (interviewId, updates) => {
  const { data, error } = await supabase
    .from("interviews")
    .update(updates)
    .eq("id", interviewId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteInterview = async (interviewId) => {
  const { error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", interviewId);
  if (error) throw error;
};

// ─── Interview Questions ─────────────────────────────────────

export const fetchQuestionsByInterviewId = async (interviewId) => {
  const { data, error } = await supabase
    .from("interview_questions")
    .select(`
      *,
      interview_question_scores (*)
    `)
    .eq("interview_id", interviewId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const fetchQuestionById = async (questionId) => {
  const { data, error } = await supabase
    .from("interview_questions")
    .select(`
      *,
      interview_question_scores (*)
    `)
    .eq("id", questionId)
    .single();
  if (error) throw error;
  return data;
};

export const createQuestion = async (questionData) => {
  const { data, error } = await supabase
    .from("interview_questions")
    .insert([questionData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const bulkCreateQuestions = async (questionsData) => {
  const { data, error } = await supabase
    .from("interview_questions")
    .insert(questionsData)
    .select();
  if (error) throw error;
  return data;
};

export const updateQuestion = async (questionId, updates) => {
  const { data, error } = await supabase
    .from("interview_questions")
    .update(updates)
    .eq("id", questionId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteQuestion = async (questionId) => {
  const { error } = await supabase
    .from("interview_questions")
    .delete()
    .eq("id", questionId);
  if (error) throw error;
};

// ─── Interview Question Scores ───────────────────────────────

export const fetchScoresByQuestionId = async (questionId) => {
  const { data, error } = await supabase
    .from("interview_question_scores")
    .select("*")
    .eq("interview_question_id", questionId);
  if (error) throw error;
  return data;
};

export const fetchScoreById = async (scoreId) => {
  const { data, error } = await supabase
    .from("interview_question_scores")
    .select("*")
    .eq("id", scoreId)
    .single();
  if (error) throw error;
  return data;
};

export const createScore = async (scoreData) => {
  const { data, error } = await supabase
    .from("interview_question_scores")
    .insert([scoreData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const bulkCreateScores = async (scoresData) => {
  const { data, error } = await supabase
    .from("interview_question_scores")
    .insert(scoresData)
    .select();
  if (error) throw error;
  return data;
};

export const updateScore = async (scoreId, updates) => {
  const { data, error } = await supabase
    .from("interview_question_scores")
    .update(updates)
    .eq("id", scoreId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteScore = async (scoreId) => {
  const { error } = await supabase
    .from("interview_question_scores")
    .delete()
    .eq("id", scoreId);
  if (error) throw error;
};

export const deleteScoresByQuestionId = async (questionId) => {
  const { error } = await supabase
    .from("interview_question_scores")
    .delete()
    .eq("interview_question_id", questionId);
  if (error) throw error;
};
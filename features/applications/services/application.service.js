// src\features\applications\services\application.service.js
import { supabase } from "../../../shared/services/supabase";
//fetch all applications by applicant id
export const fetchApplicationsByApplicantId = async (applicantId) => {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      job_postings (
        id,
        title,
        seniority_level,
        job_type,
        description,
        created_at,
        closed_at,
        companies (
          id,
          name,
          logo_url
        )
      )
    `,
    )
    .eq("candidate_profile_id", applicantId)
    .order("applied_at", { ascending: false });
  if (error) throw error;
  return data;
};

//fetch only one application
export const fetchApplicationById = async (applicationId) => {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      job_postings (
        id,
        title,
        seniority_level,
        job_type,
        description,
        created_at,
        closed_at,
        companies (
          id,
          name,
          logo_url
        )
      )
    `,
    )
    .eq("id", applicationId)
    .single();
  if (error) throw error;
  return data;
};

//apply
export const createApplication = async (applicationData) => {
  const { data, error } = await supabase
    .from("applications")
    .insert([applicationData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

//update stage for recuiter not accissable by applicant
export const updateApplicationStage = async (applicationId, stage) => {
  const { data, error } = await supabase
    .from("applications")
    .update({ current_stage: stage })
    .eq("id", applicationId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

//delete application
export const deleteApplication = async (applicationId) => {
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId);
  if (error) throw error;
};

export const fetchQuestionsByJobId = async (jobId) => {
  const cleanJobId = jobId?.trim();

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("job_id", cleanJobId);

  return data;
};

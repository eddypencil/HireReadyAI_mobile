// src\features\applications\services\application.service.js
import { supabase } from "../../../shared/services/supabase";
import { sendPushNotification } from "../../../shared/services/notifications.service";
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
      ),
      current_recruitment_stage:recruitment_stages!current_stage_id (
        id,
        name,
        stage_type,
        order_index
      ),
      application_stages (
        id,
        stage_id,
        status,
        score,
        recruitment_stages (
          id,
          name,
          stage_type,
          order_index
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
  const { data: cvReviewStage } = await supabase
    .from("recruitment_stages")
    .select("id")
    .eq("job_id", applicationData.job_id)
    .eq("stage_type", "cv_review")
    .limit(1)
    .single();

  const insertData = {
    ...applicationData,
    current_stage_id: cvReviewStage?.id || null,
  };

  const { data: application, error } = await supabase
    .from("applications")
    .insert([insertData])
    .select()
    .single();
  if (error) throw error;

  if (cvReviewStage) {
    await supabase.from("application_stages").upsert(
      {
        application_id: application.id,
        stage_id: cvReviewStage.id,
        status: "in_progress",
        started_at: new Date().toISOString(),
      },
      { onConflict: "application_id,stage_id" }
    );
  }

  // ── Notify recruiter (fire-and-forget) ───────────────────────────────────
  try {
    // Fetch the job title and company_id together
    const { data: jobData } = await supabase
      .from("job_postings")
      .select("title, company_id")
      .eq("id", applicationData.job_id)
      .single();

    if (jobData?.company_id) {
      // Find a recruiter (company member) who has a push token
      const { data: members } = await supabase
        .from("company_memberships")
        .select("profile_id, profiles(expo_push_token, full_name)")
        .eq("company_id", jobData.company_id)
        .not("profiles.expo_push_token", "is", null)
        .limit(5);

      if (members && members.length > 0) {
        // Fetch the applicant's name for the notification body
        const { data: applicantProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", applicationData.candidate_profile_id)
          .single();

        const applicantName = applicantProfile?.full_name ?? "A candidate";

        // Send to all recruiters in the company who have a push token
        for (const member of members) {
          const token = member.profiles?.expo_push_token;
          if (token) {
            sendPushNotification({
              token,
              title: "New Application Received",
              body: `${applicantName} applied for "${jobData.title}"`,
              data: {
                type: "new_application",
                application_id: application.id,
                job_id: applicationData.job_id,
              },
            });
          }
        }
      }
    }
  } catch (notifErr) {
    // Never let notification errors block the apply flow
    console.warn("[Notifications] Failed to notify recruiter:", notifErr.message);
  }
  // ────────────────────────────────────────────────────────────────────────

  return application;
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

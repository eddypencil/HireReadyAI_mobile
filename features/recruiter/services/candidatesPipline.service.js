import { supabase } from "../../../shared/services/supabase";
export async function getPipelineCandidates() {
  return supabase.from("applications").select(`
    id,
    applied_at,
    composite_score,
    profiles ( full_name ),
    job_postings ( title ),
    application_stages (
      *,
      recruitment_stages (*),
      application_stage_evaluations (*)
    )
  `);
}

export async function getStageByType(stageType) {
  const { data, error } = await supabase
    .from("recruitment_stages")
    .select("id, stage_type")
    .eq("stage_type", stageType)
    .limit(1);

  if (error) return { data: null, error };
  if (!data || data.length === 0)
    return {
      data: null,
      error: new Error(`No stage found for: "${stageType}"`),
    };

  return { data: data[0], error: null };
}

export async function closeCurrentStage(applicationId) {
  return supabase
    .from("application_stages")
    .update({
      status: "passed",
      completed_at: new Date().toISOString(),
    })
    .eq("application_id", applicationId)
    .eq("status", "in_progress");
}

export async function openStage(applicationId, stageId) {
  return supabase
    .from("application_stages")
    .update({
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .eq("application_id", applicationId)
    .eq("stage_id", stageId);
}

export async function seedAnchorStages(jobId) {
  const anchors = [
    {
      job_id: jobId,
      name: "CV Review",
      stage_type: "cv_review",
      order_index: 10,
      is_locked: true,
      description: "AI screens and scores incoming CVs.",
    },
    {
      job_id: jobId,
      name: "Shortlist",
      stage_type: "shortlist",
      order_index: 20,
      is_locked: true,
      description: "Hiring team reviews AI-shortlisted candidates and votes.",
    },
    {
      job_id: jobId,
      name: "Offer",
      stage_type: "offer",
      order_index: 9999,
      is_locked: true,
      description: "Terminal success stage — candidate receives an offer.",
    },
  ];

  const { error } = await supabase.from("recruitment_stages").insert(anchors);
  if (error) throw error;
}

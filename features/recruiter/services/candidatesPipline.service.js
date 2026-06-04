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

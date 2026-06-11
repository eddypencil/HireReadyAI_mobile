import { supabase } from "../../../shared/services/supabase";

/**
 * Fetch all applications for a specific company, with their current stage data.
 * Filters to applications belonging to jobs owned by the company.
 */
export async function getPipelineCandidates(companyId) {
  const query = supabase.from("applications").select(`
      id,
      applied_at,
      composite_score,
      is_rejected,
      cv_score,
    current_stage_id,
    answers,
    profiles ( full_name, headline, phone ),
      job_postings!inner ( id, title, company_id ),
      application_stages (
        id,
        status,
        score,
        started_at,
        completed_at,
        ai_feedback,
        recruitment_stages ( id, name, stage_type, order_index, is_locked ),
        application_stage_evaluations ( ai_score, confidence, recommendation, reasoning, strengths, weaknesses )
      )
    `);

  if (companyId) {
    query.eq("job_postings.company_id", companyId);
  }

  return query;
}

/**
 * Fetch the recruitment stages for a specific job, ordered by order_index.
 */
export async function getJobStages(jobId) {
  const { data, error } = await supabase
    .from("recruitment_stages")
    .select("id, name, stage_type, order_index, is_locked, min_score")
    .eq("job_id", jobId)
    .order("order_index", { ascending: true });

  if (error) return { data: null, error };
  return { data, error: null };
}

/**
 * Get a specific stage by type AND job_id to avoid cross-job collision.
 */
export async function getStageByTypeAndJob(stageType, jobId) {
  const { data, error } = await supabase
    .from("recruitment_stages")
    .select("id, name, stage_type, order_index, is_locked")
    .eq("stage_type", stageType)
    .eq("job_id", jobId)
    .limit(1);

  if (error) return { data: null, error };
  if (!data || data.length === 0)
    return {
      data: null,
      error: new Error(
        `No stage found for type "${stageType}" in job "${jobId}"`,
      ),
    };

  return { data: data[0], error: null };
}

/**
 * Move an application to a different stage.
 * Rules:
 *  - current_stage_id must exist on the application.
 *  - Candidate can only move to stages they don't already have a score in.
 *  - Target stage must not be locked.
 *  - Simply updates current_stage_id — no stage_status manipulation.
 */
export async function moveToStage(applicationId, targetStageId) {
  // Step 1: Verify the application has a current_stage_id
  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("current_stage_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (appError) return { error: appError };
  if (!app || !app.current_stage_id)
    return { error: new Error("Application has no current stage assigned") };

  // Step 2: Check current stage has evaluations
  const { data: currentEvals, error: evalError } = await supabase
    .from("application_stages")
    .select(
      `
      id,
      application_stage_evaluations ( ai_score )
    `,
    )
    .eq("application_id", applicationId)
    .eq("stage_id", app.current_stage_id)
    .maybeSingle();

  if (evalError) return { error: evalError };

  const currentStageEvals = currentEvals?.application_stage_evaluations;
  const currentEvalsList = currentStageEvals
    ? Array.isArray(currentStageEvals)
      ? currentStageEvals
      : [currentStageEvals]
    : [];
  // if (!currentEvalsList.some((e) => e.ai_score != null))
  //   return {
  //     error: new Error(
  //       "Current stage has no evaluations — cannot advance candidate",
  //     ),
  //   };
  // Fetch current stage type to check if it's cv_review (which has no AI evals by design)
  const { data: currentStageInfo } = await supabase
    .from("recruitment_stages")
    .select("stage_type")
    .eq("id", app.current_stage_id)
    .maybeSingle();

  const isCvReview = currentStageInfo?.stage_type === "cv_review";

  if (!isCvReview && !currentEvalsList.some((e) => e.ai_score != null))
    return {
      error: new Error(
        "Current stage has no evaluations : cannot advance candidate",
      ),
    };
  // Step 3: Check target stage isn't locked
  const { data: targetStage, error: stageError } = await supabase
    .from("recruitment_stages")
    .select("is_locked")
    .eq("id", targetStageId)
    .maybeSingle();

  if (stageError) return { error: stageError };
  if (!targetStage) return { error: new Error("Target stage not found") };

  // Allow moving into a locked stage only when coming from cv_review
  if (targetStage.is_locked && !isCvReview)
    return { error: new Error("Target stage is locked") };

  // Step 3: Check target stage doesn't already have a score
  const { data: targetStageData, error: targetError } = await supabase
    .from("application_stages")
    .select(
      `
      id,
      application_stage_evaluations ( ai_score )
    `,
    )
    .eq("application_id", applicationId)
    .eq("stage_id", targetStageId)
    .maybeSingle();

  if (targetError) return { error: targetError };

  if (targetStageData) {
    const targetStageEvals = targetStageData.application_stage_evaluations;
    const targetEvalsList = targetStageEvals
      ? Array.isArray(targetStageEvals)
        ? targetStageEvals
        : [targetStageEvals]
      : [];
    const targetHasScore = targetEvalsList.some((e) => e.ai_score != null);
    if (targetHasScore)
      return {
        error: new Error("Target stage already has a score for this candidate"),
      };
  } else {
    // Step 3b: Application has no row for this stage yet (e.g. stage was added after they applied)
    // Create one so the candidate appears in the pipeline UI
    const { error: insertErr } = await supabase
      .from("application_stages")
      .insert({
        application_id: applicationId,
        stage_id: targetStageId,
        status: "in_progress",
        started_at: new Date().toISOString(),
      });

    if (insertErr) return { error: insertErr };
  }

  // Step 4: Update current_stage_id on the application
  const { error: updateErr } = await supabase
    .from("applications")
    .update({ current_stage_id: targetStageId })
    .eq("id", applicationId);

  if (updateErr) return { error: updateErr };

  return { error: null };
}

export const closeCurrentStage = async (applicationId) =>
  supabase
    .from("application_stages")
    .update({ status: "passed", completed_at: new Date().toISOString() })
    .eq("application_id", applicationId)
    .eq("status", "in_progress");

export const openStage = async (applicationId, stageId) => {
  const { error } = await supabase
    .from("applications")
    .update({ current_stage_id: stageId })
    .eq("id", applicationId);

  return { error };
};

/**
 * Seed the 3 locked anchor stages for a newly created job.
 *
 * Order strategy (sparse to allow custom stages to slot in between):
 *   10  → CV Review   (locked, always first)
 *   20  → Shortlist   (locked, second)
 *   9999 → Offer      (locked, always last)
 *
 * Custom stages added by the recruiter will get order_index values
 * between 21–9998 (e.g. 30, 40, 50 …).
 */
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

  if (error) {
    console.error("Failed to seed anchor stages:", error);
    throw error;
  }
}

/**
 * Automatically advances candidates who have completed the stage immediately
 * preceding the Shortlist stage and met the composite score threshold.
 */
export async function autoAdvanceToShortlist(jobId, threshold = 70) {
  // 1. Get all stages ordered by index
  const { data: stages, error: stagesError } = await supabase
    .from("recruitment_stages")
    .select("*")
    .eq("job_id", jobId)
    .order("order_index", { ascending: true });

  if (stagesError || !stages || stages.length === 0)
    return { advancedCount: 0 };

  const shortlistStage = stages.find((s) => s.stage_type === "shortlist");
  if (!shortlistStage) return { advancedCount: 0 };

  // 2. Find the stage immediately before Shortlist
  const precedingStages = stages.filter(
    (s) => s.order_index < shortlistStage.order_index,
  );
  if (precedingStages.length === 0) return { advancedCount: 0 };
  const precedingStage = precedingStages[precedingStages.length - 1]; // Last one before shortlist

  // 3. Find candidates in that preceding stage
  const { data: appStages, error: appsError } = await supabase
    .from("application_stages")
    .select(
      `
      application_id,
      applications!inner (
        id,
        job_id,
        composite_score,
        is_rejected
      )
    `,
    )
    .eq("stage_id", precedingStage.id)
    .eq("status", "in_progress")
    .eq("applications.job_id", jobId)
    .eq("applications.is_rejected", false);

  if (appsError || !appStages) return { advancedCount: 0 };

  // Filter those meeting threshold
  const candidatesToAdvance = appStages.filter(
    (as) => (as.applications.composite_score || 0) >= threshold,
  );

  if (candidatesToAdvance.length === 0) return { advancedCount: 0 };

  let advancedCount = 0;

  for (const candidate of candidatesToAdvance) {
    const appId = candidate.application_id;

    // 4. Move to Shortlist stage
    await openStage(appId, shortlistStage.id);

    // 5. Add to shortlist_entries
    // We ignore constraint errors if already inserted
    const { error: insertError } = await supabase
      .from("shortlist_entries")
      .insert({
        job_id: jobId,
        application_id: appId,
      });

    if (insertError && insertError.code !== "23505") {
      // 23505 is unique violation
      console.error("Failed to add to shortlist_entries:", insertError);
    } else {
      advancedCount++;
    }
  }

  return { advancedCount };
}

export async function updateStageMinScore(stageId, min_score) {
  const { data, error } = await supabase
    .from("recruitment_stages")
    .update({ min_score })
    .eq("id", stageId);

  return { data, error };
}

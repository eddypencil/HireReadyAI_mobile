import { supabase } from "../../../shared/services/supabase";

// Fetch all active pipelines (job_postings) for a company with nested stage previews
export const getPipelines = async (companyId) => {
  const { data, error } = await supabase
    .from("job_postings")
    .select(
      `
      *,
      recruitment_stages(
        id,
        name,
        order_index
      )
    `
    )
    .eq("company_id", companyId)
    .or("closed_at.is.null,closed_at.gt." + new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Fix 5: PostgREST does not guarantee order on nested relations — sort client-side
  return (data || []).map((job) => ({
    ...job,
    recruitment_stages: (job.recruitment_stages || []).sort(
      (a, b) => a.order_index - b.order_index
    ),
  }));
};

// Fetch a single pipeline (job_posting) with full stage data ordered by order_index ASC
export const getPipeline = async (jobId) => {
  const { data, error } = await supabase
    .from("job_postings")
    .select(
      `
      *,
      recruitment_stages(*)
    `
    )
    .eq("id", jobId)
    .order("order_index", { referencedTable: "recruitment_stages", ascending: true })
    .single();

  if (error) throw error;
  return data;
};

// Create a new stage for a job pipeline
export const createStage = async (jobId, stageData) => {
  let questionsNum = null;
  let questionLessStages = ["cv_review", "offer", "shortlist"];
  if (!questionLessStages.includes(stageData.stage_type)) {
    questionsNum = stageData.num_questions || null;
  }
  const { data, error } = await supabase
    .from("recruitment_stages")
    .insert([
      {
        job_id: jobId,
        name: stageData.name,
        stage_type: stageData.stage_type,
        description: stageData.description || null,
        order_index: stageData.order_index,
        weight: stageData.weight !== undefined ? stageData.weight : 0.1,
        num_questions: questionsNum,
        pass_score: 70,
        evaluation_criteria: null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update editable fields on an existing stage
// Note: order_index is NOT updated here — use reorderStages() for that
export const updateStage = async (stageId, updates) => {
  const { data, error } = await supabase
    .from("recruitment_stages")
    .update({
      name: updates.name,
      stage_type: updates.stage_type,
      weight: updates.weight,
      description: updates.description,
      num_questions: updates.num_questions,
    })
    .eq("id", stageId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a stage by id
export const deleteStage = async (stageId) => {
  const { error } = await supabase
    .from("recruitment_stages")
    .delete()
    .eq("id", stageId);

  if (error) throw error;
};

// Reorder stages using a two-phase upsert to avoid UNIQUE(job_id, order_index) violations
// Fix 1: Phase 1 offsets all order_index by +1000, Phase 2 sets the final values
export const reorderStages = async (stages) => {
  // Phase 1: Move all to a safe range to avoid transient conflicts
  const { error: phase1Error } = await supabase
    .from("recruitment_stages")
    .upsert(
      stages.map((s) => ({
        id: s.id,
        job_id: s.job_id,
        name: s.name,
        stage_type: s.stage_type,
        description: s.description,
        order_index: s.order_index + 1000,
        num_questions: s.num_questions,
        weight: s.weight,
        pass_score: s.pass_score,
        evaluation_criteria: s.evaluation_criteria,
      }))
    );

  if (phase1Error) throw phase1Error;

  // Phase 2: Set the correct final order_index values
  const { error: phase2Error } = await supabase
    .from("recruitment_stages")
    .upsert(
      stages.map((s) => ({
        id: s.id,
        job_id: s.job_id,
        name: s.name,
        stage_type: s.stage_type,
        description: s.description,
        order_index: s.order_index,
        num_questions: s.num_questions,
        weight: s.weight,
        pass_score: s.pass_score,
        evaluation_criteria: s.evaluation_criteria,
      }))
    );

  if (phase2Error) throw phase2Error;
};

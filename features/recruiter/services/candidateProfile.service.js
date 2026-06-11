import { supabase } from '../../../shared/services/supabase';

export async function getCandidateProfile(applicationId) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      profiles ( id, full_name, headline, phone, profile_pic ),
      job_postings ( id, title, company_id, seniority_level, job_type ),
      application_stages (
        id,
        status,
        score,
        started_at,
        completed_at,
        ai_feedback,
        recruitment_stages ( id, name, stage_type, order_index, is_locked, min_score, pass_score ),
        application_stage_evaluations ( ai_score, confidence, recommendation, reasoning, strengths, weaknesses )
      )
    `)
    .eq('id', applicationId)
    .single();

  return { data, error };
}

export async function getCandidateStageQuestions(applicationStageId) {
  const { data, error } = await supabase
    .from('application_questions')
    .select(`
      *,
      application_answers (
        id,
        answer_text,
        score,
        feedback,
        recording_url,
        transcript,
        strengths,
        weaknesses,
        created_at
      )
    `)
    .eq('application_stage_id', applicationStageId)
    .order('order_index', { ascending: true });

  return { data, error };
}

export async function getJobScorePercentile(jobId, compositeScore) {
  if (!jobId || compositeScore == null) return { percentile: null, total: 0 };

  const { data, error } = await supabase
    .from('applications')
    .select('composite_score')
    .eq('job_id', jobId)
    .not('composite_score', 'is', null);

  if (error) return { percentile: null, total: 0, error };

  const scores = data.map((a) => Number(a.composite_score)).filter((s) => !isNaN(s));
  const below = scores.filter((s) => s <= Number(compositeScore)).length;
  const percentile = Math.round((below / scores.length) * 100);

  return { percentile, total: scores.length, error: null };
}

export function getPercentileTag(percentile) {
  if (percentile == null) return null;
  if (percentile >= 99) return { label: "Top 1%", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  if (percentile >= 95) return { label: "Top 5%", color: "bg-emerald-100 text-emerald-700 border-emerald-300" };
  if (percentile >= 90) return { label: "Top 10%", color: "bg-sky-blue-800 text-sky-blue-600 border-cerulean-800" };
  if (percentile >= 75) return { label: "Top 25%", color: "bg-cerulean-900 text-rich-cerulean border-cerulean-800" };
  if (percentile >= 50) return { label: "Top 50%", color: "bg-sky-blue-900 text-rich-cerulean border-cerulean-900" };
  return { label: "Below Average", color: "bg-red-50 text-red-600 border-red-200" };
}

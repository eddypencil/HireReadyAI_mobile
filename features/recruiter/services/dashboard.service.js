import { supabase } from "../../../shared/services/supabase";

export const fetchDashboardData = async (profileId) => {
  const { data: memberships, error: membershipsError } = await supabase
    .from("company_memberships")
    .select("company_id")
    .eq("profile_id", profileId);

  if (membershipsError) throw membershipsError;
  if (!memberships || memberships.length === 0)
    return {
      jobs: [],
      stats: { totalJobs: 0, totalActiveJobs: 0, totalApplicants: 0 },
    };

  const companyIds = memberships.map((m) => m.company_id);

  const { data: jobs, error: jobsError } = await supabase
    .from("job_postings")
    .select(
      `
      *,
      companies(id,name),
      applications(
        id,
        current_stage,
        applied_at,
        is_rejected,
        interviews(id),
        current_recruitment_stage:recruitment_stages!current_stage_id(
          stage_type,
          order_index
        )
      )
    `,
    )
    .in("company_id", companyIds)
    .order("created_at", { ascending: false });

  if (jobsError) throw jobsError;

  return jobs;
};

export const fetchCurrentUserName = async (profileId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", profileId)
    .single();

  if (error) throw error;

  return data?.full_name;
};

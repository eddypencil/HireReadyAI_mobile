import { supabase } from "../../../shared/services/supabase";

export const fetchDashboardData = async (profileId) => {
  // 1. Get the company_ids the recruiter belongs to
  const { data: memberships, error: membershipsError } = await supabase
    .from("company_memberships")
    .select("company_id")
    .eq("profile_id", profileId);

  if (membershipsError) throw membershipsError;
  if (!memberships || memberships.length === 0) return { jobs: [], stats: { totalJobs: 0, totalActiveJobs: 0, totalApplicants: 0 } };

  const companyIds = memberships.map((m) => m.company_id);

  // 2. Fetch job postings for these companies with joined companies and applications (and interviews)
  const { data: jobs, error: jobsError } = await supabase
    .from("job_postings")
    .select(`
      *,
      companies(id,name),
      applications(
        id,
        current_stage,
        applied_at,
        interviews(id)
      )
    `)
    .in("company_id", companyIds)
    .order("created_at", { ascending: false });

  if (jobsError) throw jobsError;

  return jobs;
};

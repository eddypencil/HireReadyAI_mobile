import { USER_ROLE } from "../../../shared/constants/enums";
import { supabase } from "../../../shared/services/supabase";

// Fetch all companies
export const fetchAllCompanies = async () => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Fetch a single company with its memberships (including profiles) and job postings
export const fetchCompanyById = async (companyId) => {
  const { data, error } = await supabase
    .from("companies")
    .select(
      `
    *,
    company_memberships(
      *,
      profiles(*)
    ),
    job_postings(*)
  `
    )
    .eq("id", companyId)
    .eq("company_memberships.profiles.role", USER_ROLE.recruiter)
    .single();
  console.log(data);
  if (error) throw error;
  return data;
};

// Create a new company
export const createCompany = async (companyData) => {
  const { data, error } = await supabase
    .from("companies")
    .insert([companyData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update an existing company
export const updateCompany = async (companyId, updates) => {
  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete a company
export const deleteCompany = async (companyId) => {
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId);
  if (error) throw error;
};

// Fetch the company and permission associated with a profile's membership
export const fetchCompanyByProfileId = async (profileId) => {
  const { data: membership, error: membershipError } = await supabase
    .from("company_memberships")
    .select("company_id, permissions")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership) return { company: null, permission: null };

  const company = await fetchCompanyById(membership.company_id);
  return { company, permission: membership.permissions };
};

// Fetch job postings for a company
export const fetchJobsByCompanyId = async (companyId) => {
  const { data, error } = await supabase
    .from("job_postings")
    .select(
      `
      *,
      applications(count),
      shortlist_entries(count)
    `,
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Fetch company members (memberships with profile details)
export const fetchCompanyMembers = async (companyId) => {
  const { data, error } = await supabase
    .from("company_memberships")
    .select(
      `
      *,
      profiles(id, full_name, role, phone)
    `,
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Update an existing job posting
export const updateJobPosting = async (jobId, updates) => {
  const { data, error } = await supabase
    .from("job_postings")
    .update(updates)
    .eq("id", jobId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

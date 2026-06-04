import { useState, useEffect } from "react";
import { fetchCompanyById, updateCompany } from "../services/companies.service";
import { addMembership, removeMembership } from "../services/memberships.service";
import { createJob, updateJob, deleteJob } from "../../jobs/services/jobs.service";

export const useCompanyDetailsViewModel = (companyId) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCompany = async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCompanyById(companyId);
      setCompany(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, [companyId]);

  // --- Company ---
  const handleUpdateCompany = async (formData) => {
    setError(null);
    try {
      const updated = await updateCompany(companyId, formData);
      setCompany((prev) => ({ ...prev, ...updated }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // --- Memberships ---
  const handleAddMembership = async (membershipData) => {
    setError(null);
    try {
      const created = await addMembership(membershipData);
      setCompany((prev) => ({
        ...prev,
        company_memberships: [...(prev.company_memberships || []), created],
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleRemoveMembership = async (membershipId) => {
    setError(null);
    try {
      await removeMembership(membershipId);
      setCompany((prev) => ({
        ...prev,
        company_memberships: prev.company_memberships.filter(
          (m) => m.id !== membershipId
        ),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Jobs ---
  const handleCreateJob = async (jobData) => {
    setError(null);
    try {
      const created = await createJob(jobData);
      setCompany((prev) => ({
        ...prev,
        job_postings: [...(prev.job_postings || []), created],
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleUpdateJob = async (jobId, formData) => {
    setError(null);
    try {
      const updated = await updateJob(jobId, formData);
      setCompany((prev) => ({
        ...prev,
        job_postings: prev.job_postings.map((j) =>
          j.id === jobId ? updated : j
        ),
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleDeleteJob = async (jobId) => {
    setError(null);
    try {
      await deleteJob(jobId);
      setCompany((prev) => ({
        ...prev,
        job_postings: prev.job_postings.filter((j) => j.id !== jobId),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    company,
    loading,
    error,
    reload: loadCompany,
    handleUpdateCompany,
    handleAddMembership,
    handleRemoveMembership,
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
  };
};

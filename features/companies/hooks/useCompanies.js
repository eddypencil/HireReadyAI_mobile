import { useState, useEffect } from "react";
import {
  fetchAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../services/companies.service";
import { addMembership } from "../services/memberships.service";

export const useCompaniesViewModel = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreate = async (formData, creatorProfileId) => {
    setError(null);
    try {
      const created = await createCompany(formData);
      
      // Automatically add the creator as a member of the company
      if (creatorProfileId) {
        await addMembership({
          company_id: created.id,
          profile_id: creatorProfileId,
          permissions: ["admin"], // default to admin for the creator
        });
      }
      
      setCompanies((prev) => [created, ...prev]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleUpdate = async (companyId, formData) => {
    setError(null);
    try {
      const updated = await updateCompany(companyId, formData);
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? updated : c))
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleDelete = async (companyId) => {
    setError(null);
    try {
      await deleteCompany(companyId);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    companies,
    loading,
    error,
    handleCreate,
    handleUpdate,
    handleDelete,
    reload: loadCompanies,
  };
};

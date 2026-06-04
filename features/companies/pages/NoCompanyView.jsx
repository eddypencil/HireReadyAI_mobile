import { useState, useEffect } from "react";
import { Building2, Plus, LogOut, ArrowLeft } from "lucide-react";
import {
  fetchAllCompanies,
  createCompany,
} from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { logOut } from "@/features/auth/services/auth.service";
import { useUser } from "@/features/auth/context/user.context";

export default function NoCompanyView({ onCompanyJoined }) {
  const { profile } = useUser();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // form state
  const [newCompany, setNewCompany] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await fetchAllCompanies();
        setCompanies(data || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleJoinCompany = async (companyId) => {
    try {
      if (!profile?.id) return;

      setJoining(companyId);

      // Add user as recruiter to existing company
      const membershipData = {
        company_id: companyId,
        profile_id: profile.id,
        permissions: { role: "recruiter" },
      };

      await addMembership(membershipData);
      onCompanyJoined(companyId);
    } catch (err) {
      console.error("Error joining company:", err);
      setError(err.message);
    } finally {
      setJoining(null);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const created = await createCompany({
        name: newCompany.name,
        industry: newCompany.industry,
        size: newCompany.size ? parseInt(newCompany.size, 10) : null,
        location: newCompany.location,
      });

      // Add user as admin (creator) to the new company
      await addMembership({
        company_id: created.id,
        profile_id: profile.id,
        permissions: { role: "admin" },
      });

      onCompanyJoined(created.id);
    } catch (err) {
      console.error("Error creating company:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-slate-900 font-sans">
        <div className="w-8 h-8 border-2 border-dark-amethyst-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-slate-500 text-sm">Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-amethyst-50 font-sans flex flex-col">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-dark-amethyst-950 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-linear-to-r from-dark-amethyst-950 to-dark-amethyst-600 bg-clip-text text-transparent">
            HireReadyAI
          </span>
        </div>
        <button
          onClick={logOut}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {isCreating ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-500"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-dark-amethyst-950">
                  Create a New Company
                </h2>
              </div>
              <form onSubmit={handleCreateCompany} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-dark-amethyst-500 focus:border-dark-amethyst-500"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={newCompany.industry}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, industry: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-dark-amethyst-500 focus:border-dark-amethyst-500"
                    placeholder="e.g. Technology, Healthcare"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Size
                    </label>
                    <input
                      type="number"
                      value={newCompany.size}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, size: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-dark-amethyst-500 focus:border-dark-amethyst-500"
                      placeholder="Number of employees"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newCompany.location}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-dark-amethyst-500 focus:border-dark-amethyst-500"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-dark-amethyst-950 text-white rounded-lg text-sm font-medium hover:bg-dark-amethyst-900 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Creating..." : "Create Company"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-dark-amethyst-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-dark-amethyst-700" />
                </div>
                <h1 className="text-3xl font-bold text-dark-amethyst-950 mb-2">
                  Join or Create a Company
                </h1>
                <p className="text-gray-600 mb-6">
                  Select a company to get started with HireReadyAI or create
                  your own
                </p>
                {companies.length > 0 && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-dark-amethyst-950 text-white rounded-lg font-medium hover:bg-dark-amethyst-900 transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create a New Company
                  </button>
                )}
              </div>

              {companies.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 mb-6">
                    No companies available to join.
                  </p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center gap-2 mx-auto px-6 py-2.5 bg-dark-amethyst-950 text-white rounded-lg font-medium hover:bg-dark-amethyst-900 transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create a Company
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 bg-dark-amethyst-100 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-lg font-bold text-dark-amethyst-700">
                              {company.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-dark-amethyst-950">
                              {company.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {company.industry || "Organization"}
                            </p>
                          </div>
                        </div>

                        {company.size && (
                          <p className="text-xs text-gray-500 mb-4">
                            {company.size.toLocaleString()} employees
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleJoinCompany(company.id)}
                        disabled={joining === company.id}
                        className="w-full mt-4 px-4 py-2 bg-dark-amethyst-50 text-dark-amethyst-700 rounded-lg text-sm font-medium hover:bg-dark-amethyst-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {joining === company.id ? "Joining..." : "Join"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

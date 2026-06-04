import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobById, fetchSimilarJobs } from "../services/jobs.service";

export default function JobDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadJob() {
      try {
        const data = await fetchJobById(id);
        setJob(data);
        const similar = await fetchSimilarJobs(id, data.seniority_level, data.job_type);
        setSimilarJobs(similar);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  if (loading) return <p clas sName="p-8 text-gray-500">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;
  if (!job) return <p className="p-8 text-gray-500">Job not found</p>;

  const company = job.companies;

  return (
    <div className="min-h-screen bg-dark-amethyst-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: main content ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* HEADER */}
          <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7">

            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-dark-amethyst-950">{job.title}</h1>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate("apply")}
                  className="px-5 py-2.5 rounded-xl bg-dark-amethyst-600 text-white text-sm font-semibold hover:bg-dark-amethyst-700 transition"
                  style={{ boxShadow: '0 2px 12px rgba(132,0,255,0.2)' }}
                >
                  Apply Now
                </button>

                <button className="w-10 h-10 rounded-xl border border-dark-amethyst-100 bg-white flex items-center justify-center hover:bg-dark-amethyst-50 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
                      stroke="#8400ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Company + location */}
            <div className="flex items-center gap-2 mt-3">
              {company?.logo_url ? (
                <img src={company.logo_url} alt={company.name}
                  className="w-8 h-8 object-contain rounded-lg border p-0.5" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-dark-amethyst-100 flex items-center justify-center text-dark-amethyst-600 font-bold text-sm">
                  {company?.name?.[0]}
                </div>
              )}
              <span className="text-dark-amethyst-600 text-sm font-medium">{company?.name}</span>
              {company?.location && (
                <>
                  <span className="text-dark-amethyst-300">•</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                      stroke="#8400ff" strokeWidth="1.5"/>
                    <circle cx="12" cy="9" r="2.5" stroke="#8400ff" strokeWidth="1.5"/>
                  </svg>
                  <span className="text-dark-amethyst-500 text-sm">{company.location}</span>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-4 flex-wrap">
              {job.job_type && (
                <span className="px-3 py-1 text-xs rounded-full bg-dark-amethyst-50 text-dark-amethyst-700 border border-dark-amethyst-100 font-medium">
                  {job.job_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              )}
              {job.seniority_level && (
                <span className="px-3 py-1 text-xs rounded-full bg-dark-amethyst-50 text-dark-amethyst-700 border border-dark-amethyst-100 font-medium capitalize">
                  {job.seniority_level}
                </span>
              )}
              {job.experience_years && (
                <span className="px-3 py-1 text-xs rounded-full bg-dark-amethyst-50 text-dark-amethyst-700 border border-dark-amethyst-100 font-medium">
                  {job.experience_years}
                </span>
              )}
            </div>

          </div>

          <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7">
            <h2 className="text-base font-bold text-dark-amethyst-950 mb-3">About this role</h2>
            <p className="text-dark-amethyst-700 leading-relaxed text-sm">{job.description}</p>
          </div>

          {job.requirements?.length > 0 && (
            <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7">
              <h2 className="text-base font-bold text-dark-amethyst-950 mb-3">Qualifications</h2>
              <ul className="space-y-2 text-dark-amethyst-700 text-sm">
                {job.requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-dark-amethyst-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.responsibilities?.length > 0 && (
            <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7">
              <h2 className="text-base font-bold text-dark-amethyst-950 mb-3">Responsibilities</h2>
              <ul className="space-y-2 text-dark-amethyst-700 text-sm">
                {job.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-dark-amethyst-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.skills?.length > 0 && (
            <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7">
              <h2 className="text-base font-bold text-dark-amethyst-950 mb-3">Skills & Tools</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <span key={i}
                    className="px-3 py-1.5 text-sm rounded-full bg-dark-amethyst-50 text-dark-amethyst-700 border border-dark-amethyst-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="space-y-5">
          {similarJobs.length > 0 && (
            <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-5">
              <h2 className="text-sm font-bold text-dark-amethyst-950 mb-4">Similar Jobs</h2>
              <div className="flex flex-col gap-4">
                {similarJobs.map((sj) => (
                  <div
                    key={sj.id}
                    onClick={() => navigate(`/jobs/${sj.id}`)}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    {sj.companies?.logo_url ? (
                      <img src={sj.companies.logo_url} alt={sj.companies.name}
                        className="w-10 h-10 rounded-xl border object-contain p-0.5 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-dark-amethyst-100 flex items-center justify-center text-dark-amethyst-600 font-bold text-sm shrink-0">
                        {sj.companies?.name?.[0]}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-dark-amethyst-900 group-hover:text-dark-amethyst-600 transition truncate">
                          {sj.title}
                        </p>
                        <button
                          onClick={e => e.stopPropagation()}
                          className="shrink-0 text-dark-amethyst-300 hover:text-dark-amethyst-600 transition"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>

                      <p className="text-xs text-dark-amethyst-400 mt-0.5">
                        {sj.companies?.name}
                        {sj.companies?.location && ` • ${sj.companies.location}`}
                      </p>

                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {sj.job_type && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-dark-amethyst-50 text-dark-amethyst-600 border border-dark-amethyst-100">
                            {sj.job_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        )}
                        {sj.seniority_level && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-dark-amethyst-50 text-dark-amethyst-600 border border-dark-amethyst-100 capitalize">
                            {sj.seniority_level}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-dark-amethyst-300 mt-2">
                        {new Date(sj.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
import { useNavigate } from "react-router-dom";

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const company = job.companies;

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-white rounded-2xl border border-dark-amethyst-100 p-6 hover:shadow-md hover:border-dark-amethyst-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">

  
        <div className="flex items-start gap-4 flex-1 min-w-0">

          
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="w-12 h-12 rounded-xl border border-dark-amethyst-100 object-contain p-1 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-dark-amethyst-100 flex items-center justify-center text-dark-amethyst-600 font-bold text-lg shrink-0">
              {company?.name?.[0]}
            </div>
          )}

          
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-dark-amethyst-950 group-hover:text-dark-amethyst-600 transition truncate">
              {job.title}
            </h2>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {company?.name && (
                <span className="text-sm text-dark-amethyst-500 font-medium">{company.name}</span>
              )}
              {company?.location && (
                <>
                  <span className="text-dark-amethyst-300 text-xs">•</span>
                  <span className="text-sm text-dark-amethyst-400">{company.location}</span>
                </>
              )}
            </div>

            
            <div className="flex gap-2 mt-3 flex-wrap">
              {job.job_type && (
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-dark-amethyst-50 text-dark-amethyst-600 border border-dark-amethyst-100 font-medium">
                  {job.job_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              )}
              {job.seniority_level && (
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-dark-amethyst-50 text-dark-amethyst-600 border border-dark-amethyst-100 font-medium capitalize">
                  {job.seniority_level}
                </span>
              )}
              {job.work_location && (
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-dark-amethyst-50 text-dark-amethyst-600 border border-dark-amethyst-100 font-medium capitalize">
                  {job.work_location.replace("_", "-")}
                </span>
              )}
              {job.salary_min && job.salary_max && (
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-dark-amethyst-50 text-dark-amethyst-600 border border-dark-amethyst-100 font-medium">
                  {job.salary_min.toLocaleString()} – {job.salary_max.toLocaleString()} EGP
                </span>
              )}
            </div>

            
            {job.responsibilities?.length > 0 && (
              <ul className="mt-4 space-y-1">
                {job.responsibilities.slice(0, 2).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-dark-amethyst-700 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-dark-amethyst-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        
        <div className="flex flex-col items-end gap-3 shrink-0">
          <button
            onClick={e => e.stopPropagation()}
            className="text-dark-amethyst-300 hover:text-dark-amethyst-600 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-xs text-dark-amethyst-400">
            {new Date(job.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric"
            })}
          </span>
        </div>

      </div>
    </div>
  );
}
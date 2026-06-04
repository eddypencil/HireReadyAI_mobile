import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/context/user.context";
import JobSearch from "../components/JobSearch";
import JobFilters from "../components/JobFilters";
import JobCard from "../components/JobCard";
import { useJobs } from "../hooks/useJobs";

export default function JobsPage() {
  const { signOutUser } = useUser();
  const navigate = useNavigate();
  const { jobs, loading, error } = useJobs();

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [jobType, setJobType] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  async function handleLogout() {
    await signOutUser();
    navigate("/login");
  }

  function clearFilters() {
    setLevel("");
    setJobType("");
    setWorkLocation("");
    setDatePosted("");
    setSalaryMin("");
    setSalaryMax("");
    setSearch("");
  }

  const filteredJobs = jobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase())

    const matchLevel = level ? job.seniority_level === level : true;
    const matchType = jobType ? job.job_type === jobType : true;
    const matchLocation = workLocation ? job.work_location === workLocation : true;

    const matchDate = (() => {
      if (!datePosted) return true;
      const posted = new Date(job.created_at);
      const now = new Date();
      const diff = (now - posted) / (1000 * 60 * 60 * 24);
      if (datePosted === "24h") return diff <= 1;
      if (datePosted === "week") return diff <= 7;
      if (datePosted === "month") return diff <= 30;
      return true;
    })();

    const matchSalary = (() => {
    if (!salaryMin && !salaryMax) return true
    if (!job.salary_min && !job.salary_max) return false
    const min = Number(salaryMin) || 0
    const max = Number(salaryMax) || Infinity
    return job.salary_min >= min && job.salary_max <= max
    })()

    return matchSearch && matchLevel && matchType && matchLocation && matchDate && matchSalary;
  });

  if (loading) return <p className="p-8 text-dark-amethyst-500">Loading jobs...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-dark-amethyst-50">

      
      <div
        className="relative overflow-hidden px-8 py-16"
        style={{
          background: 'linear-gradient(135deg, #120024 0%, #350066 40%, #6900cc 70%, #9c33ff 100%)',
        }}
      >
        {/* glow blobs */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(156,51,255,0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(94,0,255,0.4) 0%, transparent 45%)
          `
        }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-dark-amethyst-300 text-sm font-medium tracking-widest mb-3">
            HireReadyAI - Job Board
          </p>
          <h1
            className="text-white font-black leading-tight mb-3"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}
          >
            Find your dream job
          </h1>
          <p className="text-dark-amethyst-200/70 text-base max-w-lg">
            Browse our latest job openings and apply to the best opportunities today.
          </p>
        </div>
      </div>

      
      <div className="max-w-6xl mx-auto px-6 -mt-6 relative z-10">
        <JobSearch search={search} setSearch={setSearch} />
      </div>

      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-dark-amethyst-500 text-sm mb-6">
          <span className="font-semibold text-dark-amethyst-900">{filteredJobs.length}</span> job{filteredJobs.length !== 1 ? 's' : ''} found
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          
          <div className="lg:col-span-1">
            <JobFilters
              level={level} setLevel={setLevel}
              jobType={jobType} setJobType={setJobType}
              workLocation={workLocation} setWorkLocation={setWorkLocation}
              datePosted={datePosted} setDatePosted={setDatePosted}
              salaryMin={salaryMin} setSalaryMin={setSalaryMin}
              salaryMax={salaryMax} setSalaryMax={setSalaryMax}
              onClear={clearFilters}
            />
          </div>

          
          <div className="lg:col-span-3 space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-12 text-center">
                <p className="text-dark-amethyst-400 text-sm">No jobs found matching your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-dark-amethyst-600 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      
      {/* <button
        onClick={handleLogout}
        className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-dark-amethyst-600 hover:bg-dark-amethyst-700 transition shadow-lg z-50"
      >
        Log out
      </button> */}

    </div>
  );
}
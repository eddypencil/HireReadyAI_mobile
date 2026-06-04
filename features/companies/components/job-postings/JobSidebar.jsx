import { Building2, Plus, X, Briefcase } from "lucide-react";

export default function JobSidebar({ 
  jobs, 
  activeTab, 
  searchQuery, 
  selectedJobId, 
  setSelectedJobId, 
  setIsEditing, 
  navigate,
  isOpen,
  onClose
}) {
  const getJobStatus = (job) => {
    let today = Date.now();
    return Date.parse(job.closed_at) < today ? "Closed" : "Published";
  };

  const filteredJobs = jobs.filter((job) => {
    const status = getJobStatus(job);
    const matchesTab = activeTab === "All" || (status === "Published" && activeTab === "Open") || (status === "Closed" && activeTab === "Closed");
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100] lg:hidden transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-[110] w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0 h-full overflow-hidden
          transform transition-transform duration-200 ease-in-out lg:relative lg:z-auto lg:transform-none lg:w-[360px]
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
              Open Roles
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Click to view details</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/companies/jd-generator")}
              className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 bg-gray-50/50">
          {filteredJobs.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">No jobs found.</div>
          ) : (
            filteredJobs.map((job) => {
              const isSelected = job.id === selectedJobId;
              const status = getJobStatus(job);
              const applicantCount = job.applications?.[0]?.count || 0;

              return (
                <button
                  key={job.id}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setIsEditing(false);
                    onClose(); // Auto close on mobile
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left border transition-colors group cursor-pointer ${
                    isSelected 
                      ? "bg-dark-amethyst-50 border-dark-amethyst-200" 
                      : "bg-white hover:bg-dark-amethyst-50 hover:border-dark-amethyst-200 border-transparent shadow-xs hover:shadow-none"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected 
                      ? "bg-dark-amethyst-100 text-dark-amethyst-700" 
                      : "bg-gray-100 text-gray-500 group-hover:bg-dark-amethyst-100 group-hover:text-dark-amethyst-600"
                  }`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium leading-tight truncate transition-colors ${
                        isSelected 
                          ? "text-dark-amethyst-900" 
                          : "text-gray-800 group-hover:text-dark-amethyst-900"
                      }`}>
                        {job.title}
                      </p>
                      {status === "Published" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ml-2 shadow-[0_0_4px_rgba(52,211,153,0.5)]" title="Published"></span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 ml-2" title="Closed"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {job.seniority_level || "Any Seniority"} &middot; {applicantCount} applicant{applicantCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

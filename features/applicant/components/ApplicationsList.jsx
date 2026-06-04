import { APPLICATION_STAGE } from "@/shared/constants/enums";

const stageConfig = {
  [APPLICATION_STAGE.applied]: { label: "Applied", color: "bg-blue-100 text-blue-700" },
  [APPLICATION_STAGE.screening]: { label: "Screening", color: "bg-yellow-100 text-yellow-700" },
  [APPLICATION_STAGE.shortlisted]: { label: "Shortlisted", color: "bg-purple-100 text-purple-700" },
  [APPLICATION_STAGE.interview]: { label: "Interview", color: "bg-indigo-100 text-indigo-700" },
  [APPLICATION_STAGE.hired]: { label: "Hired", color: "bg-green-100 text-green-700" },
  [APPLICATION_STAGE.rejected]: { label: "Rejected", color: "bg-red-100 text-red-700" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ApplicationsList({ applications }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800 text-lg mb-2">
          Active applications
        </h2>
        <p className="text-sm text-gray-400">No applications yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 text-lg">
          Active applications
        </h2>
        <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
          View all &gt;
        </button>
      </div>

      {applications.map((app) => {
        const job = app.job_postings;
        const company = job?.companies;
        const stage = stageConfig[app.current_stage] || { label: app.current_stage, color: "bg-gray-100 text-gray-700" };

        return (
          <div
            key={app.id}
            className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-gray-800 truncate">
                    {job?.title || "Unknown Position"}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stage.color}`}>
                    {stage.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {company?.name || "Unknown Company"}
                </p>
                <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                  <span>Applied {formatDate(app.applied_at)}</span>
                  {job?.closed_at && (
                    <span>Closes {formatDate(job.closed_at)}</span>
                  )}
                </div>
              </div>
              <button className="text-violet-600 text-sm font-medium border border-violet-200 px-3 py-1 rounded-full hover:bg-violet-50 transition-colors shrink-0">
                Open &gt;
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

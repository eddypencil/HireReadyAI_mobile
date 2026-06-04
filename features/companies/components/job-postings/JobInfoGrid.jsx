import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Wand2,
  User,
  ChevronRight,
  ExternalLink,
  Copy,
} from "lucide-react";

export default function JobInfoGrid({
  selectedJob,
  isEditing,
  editForm,
  setEditForm,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-dark-amethyst-400"></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" /> Seniority Level
          </div>
          {isEditing ? (
            <input
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
              value={editForm.seniority_level || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, seniority_level: e.target.value })
              }
            />
          ) : (
            <p className="text-sm font-medium text-gray-900 capitalize">
              {selectedJob.seniority_level || "Engineering"}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" /> Location
          </div>
          {isEditing ? (
            <input
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
              value={editForm.work_location || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, work_location: e.target.value })
              }
            />
          ) : (
            <p className="text-sm font-medium text-gray-900">
              {selectedJob.work_location || "Remote"}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Briefcase className="w-3.5 h-3.5" /> Type
          </div>
          {isEditing ? (
            <input
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
              value={editForm.job_type || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, job_type: e.target.value })
              }
            />
          ) : (
            <p className="text-sm font-medium text-gray-900 capitalize">
              {selectedJob.job_type?.replace("_", "-") || "Full-time"}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <DollarSign className="w-3.5 h-3.5" /> Salary
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
                value={editForm.salary_min || ""}
                placeholder="Min"
                onChange={(e) =>
                  setEditForm({ ...editForm, salary_min: e.target.value })
                }
              />
              <span>-</span>
              <input
                type="number"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
                value={editForm.salary_max || ""}
                placeholder="Max"
                onChange={(e) =>
                  setEditForm({ ...editForm, salary_max: e.target.value })
                }
              />
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-900">
              {selectedJob.salary_min
                ? `$${selectedJob.salary_min.toLocaleString()}`
                : "N/A"}{" "}
              -{" "}
              {selectedJob.salary_max
                ? `$${selectedJob.salary_max.toLocaleString()}`
                : "N/A"}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" /> Published
          </div>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(selectedJob.created_at)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Wand2 className="w-3.5 h-3.5 text-mauve-magic-500" /> AI Shortlist
          </div>
          <p className="text-sm font-medium text-gray-900">
            {selectedJob.shortlist_entries?.[0]?.count || 0} strong fits
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-gray-100">
        <button className="flex items-center gap-2 bg-dark-amethyst-600 hover:bg-dark-amethyst-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <User className="w-4 h-4" />
          Open candidate board <ChevronRight className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          <ExternalLink className="w-4 h-4" />
          View public posting
        </button>
        <button className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          <Copy className="w-4 h-4" />
          Copy link
        </button>
      </div>
    </div>
  );
}

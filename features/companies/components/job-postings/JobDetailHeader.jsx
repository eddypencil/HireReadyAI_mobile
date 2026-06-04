import { Wand2, Edit,
   X, Save, Menu } from "lucide-react";

export default function JobDetailHeader({ 
  selectedJob, 
  isEditing, 
  editForm, 
  setEditForm, 
  handleEditClick, 
  handleCancelEdit, 
  handleSave, 
  saving,
  onOpenSidebar
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={onOpenSidebar}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          {isEditing ? (
            <input
              type="text"
              className="w-full font-bold bg-gray-50 border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
          ) : (
            selectedJob.title
          )}
        </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 capitalize lg:ml-0 ml-10">
          <span>{selectedJob.seniority_level || "Any Seniority"}</span>
          <span>&middot;</span>
          <span>{selectedJob.work_location || "Any Location"}</span>
          <span>&middot;</span>
          <span>{selectedJob.job_type?.replace("_", "-") || "Full-time"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {!isEditing ? (
          <>
            <button className="flex items-center gap-2 bg-gradient-to-r from-mauve-magic-500 to-dark-amethyst-500 hover:from-mauve-magic-600 hover:to-dark-amethyst-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
              <Wand2 className="w-4 h-4" />
              {/* TODO:  */}
              Regenerate with AI
            </button>
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors shadow-xs"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-dark-amethyst-600 hover:bg-dark-amethyst-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

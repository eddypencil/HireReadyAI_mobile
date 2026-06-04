import { CheckCircle, X } from "lucide-react";

export default function JobContentCards({ selectedJob, isEditing, editForm, setEditForm }) {
  // Helper for array inputs
  const handleArrayInputKeyDown = (e, field) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const value = e.target.value.trim();
      setEditForm((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), value],
      }));
      e.target.value = "";
    }
  };

  const removeArrayItem = (index, field) => {
    setEditForm((prev) => {
      const newArray = [...(prev[field] || [])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  return (
    <>
      {/* Job Summary */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:p-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Job summary</h3>
        {isEditing ? (
          <textarea
            rows={4}
            className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400"
            value={editForm.description || ""}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
        ) : (
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {selectedJob.description || "No description provided."}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Responsibilities */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:p-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Responsibilities</h3>
          <ul className="space-y-3">
            {isEditing ? (
              <>
                {(editForm.responsibilities || []).map((resp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <button
                      onClick={() => removeArrayItem(i, "responsibilities")}
                      className="mt-0.5 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <input
                      value={resp}
                      onChange={(e) => {
                        const newArr = [...editForm.responsibilities];
                        newArr[i] = e.target.value;
                        setEditForm({ ...editForm, responsibilities: newArr });
                      }}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
                    />
                  </li>
                ))}
                <li>
                  <input
                    type="text"
                    placeholder="Type and press Enter to add..."
                    onKeyDown={(e) => handleArrayInputKeyDown(e, "responsibilities")}
                    className="w-full text-sm bg-white border border-gray-200 rounded px-3 py-2 text-gray-500"
                  />
                </li>
              </>
            ) : (
              (selectedJob.responsibilities || []).map((resp, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-dark-amethyst-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 leading-relaxed">{resp}</span>
                </li>
              ))
            )}
            {!isEditing && (!selectedJob.responsibilities || selectedJob.responsibilities.length === 0) && (
              <span className="text-sm text-gray-400">None specified.</span>
            )}
          </ul>
        </div>

        {/* Requirements */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:p-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Requirements</h3>
          <ul className="space-y-3">
            {isEditing ? (
              <>
                {(editForm.requirements || []).map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <button
                      onClick={() => removeArrayItem(i, "requirements")}
                      className="mt-0.5 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <input
                      value={req}
                      onChange={(e) => {
                        const newArr = [...editForm.requirements];
                        newArr[i] = e.target.value;
                        setEditForm({ ...editForm, requirements: newArr });
                      }}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
                    />
                  </li>
                ))}
                <li>
                  <input
                    type="text"
                    placeholder="Type and press Enter to add..."
                    onKeyDown={(e) => handleArrayInputKeyDown(e, "requirements")}
                    className="w-full text-sm bg-white border border-gray-200 rounded px-3 py-2 text-gray-500"
                  />
                </li>
              </>
            ) : (
              (selectedJob.requirements || []).map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-dark-amethyst-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 leading-relaxed">{req}</span>
                </li>
              ))
            )}
            {!isEditing && (!selectedJob.requirements || selectedJob.requirements.length === 0) && (
              <span className="text-sm text-gray-400">None specified.</span>
            )}
          </ul>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:p-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              {(editForm.skills || []).map((skill, i) => (
                <div key={i} className="flex items-center gap-1 bg-mauve-magic-50 text-mauve-magic-700 border border-mauve-magic-200 px-3 py-1.5 rounded-full text-sm font-medium">
                  {skill}
                  <button onClick={() => removeArrayItem(i, "skills")} className="hover:text-red-500 ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Add skill..."
                onKeyDown={(e) => handleArrayInputKeyDown(e, "skills")}
                className="text-sm bg-white border border-gray-200 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-mauve-magic-400 w-32"
              />
            </>
          ) : (
            (selectedJob.skills || []).map((skill, i) => (
              <span key={i} className="bg-mauve-magic-50 text-mauve-magic-700 border border-mauve-magic-200 px-4 py-1.5 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))
          )}
          {!isEditing && (!selectedJob.skills || selectedJob.skills.length === 0) && (
            <span className="text-sm text-gray-400">None specified.</span>
          )}
        </div>
      </div>
    </>
  );
}

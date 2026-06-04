import React from "react";

export default function ComparisonCard({ application, provided, isDragging }) {
  const profile = application.profiles;
  
  const getInitials = (name) => {
    if (!name) return "NA";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const dimensions = application.cv_dimension_scores || [];

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`bg-white rounded-xl shadow-sm border p-6 min-w-[280px] w-[320px] shrink-0 font-sans transition-shadow ${
        isDragging ? "border-dark-amethyst-500 shadow-lg ring-1 ring-dark-amethyst-500" : "border-gray-100 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold shrink-0">
          {getInitials(profile?.full_name)}
        </div>
        <div>
          <p className="font-semibold text-[#0f172a] leading-tight">{profile?.full_name}</p>
          <p className="text-xs text-gray-500">Composite {application.composite_score}</p>
        </div>
      </div>

      <div className="space-y-4">
        {dimensions.map((dim, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <span className="text-sm text-gray-500 truncate mr-3 w-28" title={dim.dimension_name}>
              {dim.dimension_name}
            </span>
            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden shrink-0">
                <div 
                  className="h-full bg-dark-amethyst-600 rounded-full" 
                  style={{ width: `${dim.score}%` }} 
                />
              </div>
              <span className="text-xs font-semibold text-[#0f172a] w-5 text-right">{dim.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

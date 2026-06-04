import React from "react";
import { Link } from "react-router-dom";
import { GitBranch } from "lucide-react";

const SENIORITY_COLORS = {
  intern: "bg-sky-100 text-sky-700",
  junior: "bg-emerald-100 text-emerald-700",
  mid: "bg-dark-amethyst-100 text-dark-amethyst-700",
  senior: "bg-mauve-magic-100 text-mauve-magic-700",
  lead: "bg-orange-100 text-orange-700",
};

export default function PipelineCard({ pipeline }) {
  const stages = pipeline.recruitment_stages || [];
  const stageCount = stages.length;
  const previewStages = stages.slice(0, 4);
  const overflow = stageCount - 4;

  const createdDate = new Date(pipeline.created_at).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  const seniorityColor =
    SENIORITY_COLORS[pipeline.seniority_level] ||
    "bg-gray-100 text-gray-600";

  return (
    <Link
      to={`/companies/pipelines/${pipeline.id}`}
      className="block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-dark-amethyst-200 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 bg-dark-amethyst-100 rounded-lg flex items-center justify-center shrink-0">
          <GitBranch className="w-4 h-4 text-dark-amethyst-600" />
        </div>
        {pipeline.seniority_level && (
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${seniorityColor}`}
          >
            {pipeline.seniority_level.charAt(0).toUpperCase() +
              pipeline.seniority_level.slice(1)}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-dark-amethyst-950 text-base mb-1 group-hover:text-dark-amethyst-700 transition-colors leading-snug">
        {pipeline.title}
      </h3>
      <p className="text-xs text-gray-400 mb-4">Created {createdDate}</p>

      {/* Stage Preview */}
      {stageCount > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {previewStages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-0.5 truncate max-w-[90px]">
                {stage.name}
              </span>
              {(idx < previewStages.length - 1 || overflow > 0) && (
                <span className="text-gray-300 text-xs">→</span>
              )}
            </React.Fragment>
          ))}
          {overflow > 0 && (
            <span className="text-xs font-medium text-dark-amethyst-600 bg-dark-amethyst-50 border border-dark-amethyst-200 rounded px-2 py-0.5">
              +{overflow}
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic mb-4">No stages yet</p>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 font-medium">
        {stageCount} {stageCount === 1 ? "stage" : "stages"}
      </div>
    </Link>
  );
}

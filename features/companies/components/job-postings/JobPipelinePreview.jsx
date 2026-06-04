import { GitBranch, Wand2, ChevronRight } from "lucide-react";

export default function JobPipelinePreview({ pipelineStages, loadingStages, selectedJobId, selectedJobTitle, navigate }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xs font-bold tracking-widest uppercase text-dark-amethyst-600 mb-1">
            Hiring pipeline for this job
          </h2>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-dark-amethyst-950" />
            <h3 className="text-lg font-bold text-gray-900">{selectedJobTitle} Pipeline</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {pipelineStages.length} stages &middot; Owned by this job posting
          </p>
        </div>
        <button 
          onClick={() => navigate(`/companies/pipelines/${selectedJobId}`)}
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <GitBranch className="w-4 h-4" />
          Edit pipeline
        </button>
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200">
        {loadingStages ? (
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-64 h-24 shrink-0 bg-gray-50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : pipelineStages.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
            No stages defined for this pipeline.
          </div>
        ) : (
          <div className="flex gap-4 min-w-max">
            {pipelineStages.map((stage, idx) => (
              <div key={stage.id} className="flex items-center">
                <div className="w-64 border border-gray-200 rounded-xl p-4 bg-white shadow-xs">
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                    Stage {idx + 1}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mb-3 truncate">
                    {stage.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">
                      {Math.round((stage.weight || 0) * 100)}%
                    </span>
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <Wand2 className="w-3 h-3" /> AI
                    </span>
                  </div>
                </div>
                {idx < pipelineStages.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-300 mx-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

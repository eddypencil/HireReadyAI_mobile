import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { usePipeline } from "../hooks/usePipeline";
import PipelineBuilder from "../components/PipelineBuilder";

export default function PipelineBuilderPage() {
  const { jobId } = useParams();
  const {
    job,
    stages,
    loading,
    error,
    warning,
    handleAddStage,
    handleUpdateStage,
    handleDeleteStage,
    handleReorderStages,
  } = usePipeline(jobId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-dark-amethyst-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 p-8">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-red-600 text-center">{error}</p>
        <Link
          to="/companies/pipelines"
          className="inline-flex items-center gap-1.5 text-sm text-dark-amethyst-600 hover:text-dark-amethyst-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pipelines
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh lg:h-full font-sans bg-gray-50/30 relative">
      {warning && (
        <div className="fixed sm:absolute top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg transition-all">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{warning}</p>
        </div>
      )}

      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Link
            to="/companies/pipelines"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-dark-amethyst-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Pipelines</span>
          </Link>
          <span className="text-gray-300 shrink-0" aria-hidden> / </span>
          <span className="text-sm font-semibold text-dark-amethyst-950 truncate">
            {job?.title}
          </span>
        </div>

        {job?.seniority_level && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-dark-amethyst-100 text-dark-amethyst-700 shrink-0 capitalize whitespace-nowrap">
            {job.seniority_level}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <PipelineBuilder
          job={job}
          stages={stages}
          onAddStage={handleAddStage}
          onUpdateStage={handleUpdateStage}
          onDeleteStage={handleDeleteStage}
          onReorderStages={handleReorderStages}
        />
      </div>
    </div>
  );
}

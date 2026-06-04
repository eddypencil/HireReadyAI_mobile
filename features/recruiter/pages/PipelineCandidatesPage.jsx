import { useState, useEffect, useRef } from "react";
import { supabase } from "@/shared/services/supabase";
import {
  getPipelineCandidates,
  getStageByType,
  closeCurrentStage,
  openStage,
} from "../services/candidatesPipline.service";
const STAGES = [
  { key: "cv_screening", label: "CV Screening", color: "#9c33ff" },
  { key: "coding_test", label: "Coding Test", color: "#8400ff" },
  {
    key: "technical_interview",
    label: "Technical Interview",
    color: "#6900cc",
  },
  { key: "hr_interview", label: "HR Interview", color: "#4f0099" },
  { key: "offer", label: "Offer", color: "#350066" },
];
const STAGE_TYPE_MAP = {
  cv_screening: "cv",
  coding_test: "coding",
  technical_interview: "technical",
  hr_interview: "hr",
  offer: "offer",
};

function mapStage(type) {
  const t = (type || "").toLowerCase();

  if (["cv", "cv_screening"].includes(t)) return "cv_screening";
  if (["coding", "coding_test"].includes(t)) return "coding_test";

  if (
    ["technical", "technical_interview", "interview", "interviewed"].includes(t)
  )
    return "technical_interview";

  if (["hr", "hr_interview"].includes(t)) return "hr_interview";

  if (["offer"].includes(t)) return "offer";

  return "cv_screening";
}
const FIT_STYLES = {
  "Strong Fit": {
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  "Good Fit": {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  "Needs Review": {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  Reject: { bg: "bg-red-100", text: "text-red-600", border: "border-red-200" },
};

function getFit(score) {
  if (score >= 85) return "Strong Fit";
  if (score >= 70) return "Good Fit";
  if (score >= 55) return "Needs Review";
  return "Reject";
}
/* ───────── DATE ───────── */
function formatAppliedDate(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d ago`;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h ago`;

  const mins = Math.floor(diff / (1000 * 60));
  return `${mins}m ago`;
}

const scoreColor = (score) => {
  if (score >= 85) return { bg: "bg-emerald-100", text: "text-emerald-700" };
  if (score >= 70) return { bg: "bg-violet-100", text: "text-violet-700" };
  if (score >= 55) return { bg: "bg-amber-100", text: "text-amber-700" };
  return { bg: "bg-red-100", text: "text-red-600" };
};

const scoreBarColor = (score) => {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-violet-600";
  if (score >= 55) return "bg-amber-500";
  return "bg-red-500";
};

// ─── Avatar Component ─────────────────────────────────────────────────────────
const Avatar = ({ initials, size = "md" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm" };
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white shrink-0`}
      style={{
        background: "linear-gradient(135deg, #8400ff 0%, #4f0099 100%)",
      }}
    >
      {initials}
    </div>
  );
};

// ─── Score Badge ──────────────────────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  const { bg, text } = scoreColor(score);
  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${bg} ${text}`}>
      {score}
    </span>
  );
};

// ─── Fit Badge ────────────────────────────────────────────────────────────────
const FitBadge = ({ fit }) => {
  const s = FIT_STYLES[fit] || FIT_STYLES["Good Fit"];
  const icons = {
    "Strong Fit": "✦",
    "Good Fit": "✓",
    "Needs Review": "⚑",
    Reject: "✕",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className="text-[10px]">{icons[fit]}</span> {fit}
    </span>
  );
};

// ─── Score Bar ────────────────────────────────────────────────────────────────
const ScoreBar = ({ score, label }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-dark-amethyst-500">{label}</span>
      <span className="text-xs font-semibold text-dark-amethyst-700">
        {score}/100
      </span>
    </div>
    <div className="w-full h-1.5 rounded-full bg-dark-amethyst-100 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

// ─── Candidate Card ───────────────────────────────────────────────────────────
const CandidateCard = ({ candidate, onDragStart, isDragging }) => {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(candidate)}
      className={`bg-white rounded-2xl border border-dark-amethyst-100 p-4 cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group ${isDragging ? "opacity-40 scale-95" : ""}`}
      style={{ boxShadow: "0 1px 4px rgba(132,0,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar initials={candidate.avatar} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-dark-amethyst-950 leading-tight truncate">
            {candidate.name}
          </p>
          <p className="text-xs text-dark-amethyst-400 mt-0.5 flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {candidate.applied}
          </p>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition w-7 h-7 rounded-lg border border-dark-amethyst-100 flex items-center justify-center hover:bg-dark-amethyst-50">
          <svg
            className="w-3.5 h-3.5 text-dark-amethyst-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Fit badge + overall score */}
      <div className="flex items-center justify-between mb-3">
        <FitBadge fit={candidate.fit} />
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-dark-amethyst-500">Overall</span>
          <ScoreBadge score={candidate.overall} />
        </div>
      </div>

      {/* Score bar */}
      <ScoreBar score={candidate.stage_score} label="Stage score" />
    </div>
  );
};

// ─── Column ───────────────────────────────────────────────────────────────────
const PipelineColumn = ({
  stage,
  candidates,
  onDragStart,
  dragOverStage,
  onDragOver,
  onDrop,
  draggingCandidate,
}) => {
  const isOver = dragOverStage === stage.key;
  return (
    <div
      className={`flex flex-col min-w-[270px] w-[270px] shrink-0 rounded-2xl transition-all duration-200 ${isOver ? "ring-2 ring-dark-amethyst-400 ring-offset-2" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(stage.key);
      }}
      onDrop={() => onDrop(stage.key)}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: stage.color }}
          />
          <span className="text-sm font-bold text-dark-amethyst-950">
            {stage.label}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-dark-amethyst-100 text-dark-amethyst-600 ml-1">
            {candidates.length}
          </span>
        </div>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-dark-amethyst-100 transition">
          <svg
            className="w-4 h-4 text-dark-amethyst-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Cards scroll container */}
      <div
        className={`flex-1 overflow-y-auto space-y-3 px-1 pb-4 pr-2 transition-all duration-200 ${isOver ? "bg-dark-amethyst-50/60 rounded-xl" : ""}`}
        style={{ maxHeight: "calc(100vh - 230px)", minHeight: 120 }}
      >
        {candidates.length === 0 ? (
          <div
            className={`rounded-xl border-2 border-dashed h-24 flex items-center justify-center transition-all ${isOver ? "border-dark-amethyst-400 bg-dark-amethyst-50" : "border-dark-amethyst-100"}`}
          >
            <p className="text-xs text-dark-amethyst-300">Drop here</p>
          </div>
        ) : (
          candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              onDragStart={onDragStart}
              isDragging={draggingCandidate?.id === c.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

function resolveCurrentStage(stages = []) {
  if (!stages.length) return null;

  const inProgress = stages.find((s) => s.status === "in_progress");
  if (inProgress) return inProgress;

  const passed = (stages || [])
    .filter((s) => s?.status === "passed")
    .sort(
      (a, b) =>
        (b.recruitment_stages?.order_index || 0) -
        (a.recruitment_stages?.order_index || 0),
    );

  return passed[0] || null;
}
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PipelineCandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [search, setSearch] = useState("");
  const [filterFit, setFilterFit] = useState("All");
  const [draggingCandidate, setDraggingCandidate] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef(null);
  const [loadingDrop, setLoadingDrop] = useState(false);

  useEffect(() => {
    loadPipeline();
  }, []);

  async function loadPipeline() {
    const { data, error } = await getPipelineCandidates();
    if (error) {
      console.error(error);
      return;
    }

    if (data?.length) {
      setJobTitle(data[0]?.job_postings?.title || "");
    }

    const mapped = data.map((app) => {
      const currentStage = resolveCurrentStage(app.application_stages);

      const stageType = currentStage?.recruitment_stages?.stage_type || "cv";

      const evaluation = currentStage?.application_stage_evaluations?.[0];

      const score = evaluation?.ai_score || currentStage?.score || 0;

      return {
        id: app.id,

        name: app.profiles?.full_name || "Unknown Candidate",

        avatar:
          app.profiles?.full_name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2) || "NA",

        stage: mapStage(stageType),

        overall: app.composite_score || score,

        stage_score: currentStage?.score || score,

        fit: getFit(score),

        applied: formatAppliedDate(app.applied_at),
      };
    });
    console.log("ALL MAPPED CANDIDATES:", mapped);
    setCandidates(mapped);
  }

  /* ───────── FILTERING ───────── */
  const filtered = candidates.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());

    const matchFit = filterFit === "All" || c.fit === filterFit;

    return matchSearch && matchFit;
  });

  const byStage = (key) => filtered.filter((c) => c.stage === key);

  // Drag & drop
  const handleDragStart = (candidate) => setDraggingCandidate(candidate);

  const handleDrop = async (targetStageKey) => {
    if (!draggingCandidate || loadingDrop) return;

    setLoadingDrop(true);
    const previousCandidates = [...candidates];

    try {
      const stageType = STAGE_TYPE_MAP[targetStageKey];

      const { data: stageRecord, error: stageError } =
        await getStageByType(stageType);

      if (stageError || !stageRecord) {
        throw new Error("Stage not found");
      }

      const { error: closeErr } = await closeCurrentStage(draggingCandidate.id);
      if (closeErr) throw closeErr;
      const { error: openErr } = await openStage(
        draggingCandidate.id,
        stageRecord.id,
      );
      if (openErr) throw openErr;

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === draggingCandidate.id ? { ...c, stage: targetStageKey } : c,
        ),
      );

      await loadPipeline();
    } catch (err) {
      console.error("DROP FAILED:", err);
      setCandidates(previousCandidates);
      alert("Something went wrong while updating stage.");
    } finally {
      setDraggingCandidate(null);
      setDragOverStage(null);
      setLoadingDrop(false);
    }
  };
  const totalInFlight = candidates.length;

  return (
    <div
      className="min-h-screen bg-dark-amethyst-50"
      onDragEnd={() => {
        if (loadingDrop) return;
        setDraggingCandidate(null);
        setDragOverStage(null);
      }}
    >
      {/* ── Top bar ── */}
      <div
        className="bg-white border-b border-dark-amethyst-100 px-6 py-4 sticky top-0 z-30"
        style={{ boxShadow: "0 2px 16px rgba(132,0,255,0.06)" }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-dark-amethyst-950 leading-tight">
              Candidate Pipeline
            </h1>
            <p className="text-xs text-dark-amethyst-500 mt-0.5">
              {jobTitle} Pipeline ·{" "}
              <span className="font-semibold text-dark-amethyst-600">
                {totalInFlight}
              </span>{" "}
              candidates in flight
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-amethyst-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates, jobs…"
              className="w-full h-10 rounded-xl pl-9 pr-16 text-sm text-dark-amethyst-900 bg-dark-amethyst-50 border border-dark-amethyst-100 outline-none transition-all duration-200 placeholder:text-dark-amethyst-300"
              onFocus={(e) => {
                e.target.style.borderColor = "#8400ff";
                e.target.style.boxShadow = "0 0 0 3px rgba(132,0,255,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "";
                e.target.style.boxShadow = "none";
              }}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-dark-amethyst-400 border border-dark-amethyst-200 rounded px-1.5 py-0.5 bg-white font-mono">
              ⌘K
            </kbd>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Filter button */}
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${showFilters ? "bg-dark-amethyst-600 text-white border-dark-amethyst-600" : "border-dark-amethyst-200 text-dark-amethyst-600 bg-white hover:bg-dark-amethyst-50"}`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-amethyst-100 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-dark-amethyst-500 uppercase tracking-wide">
              Fit:
            </span>
            {["All", "Strong Fit", "Good Fit", "Needs Review", "Reject"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilterFit(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    filterFit === f
                      ? "bg-dark-amethyst-600 text-white border-dark-amethyst-600"
                      : "bg-white text-dark-amethyst-600 border-dark-amethyst-200 hover:bg-dark-amethyst-50"
                  }`}
                >
                  {f}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {/* ── Stage summary pills ── */}
      <div className="px-6 py-4 flex items-center gap-3 overflow-x-auto">
        {STAGES.map((s) => {
          const count = byStage(s.key).length;
          return (
            <div
              key={s.key}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-dark-amethyst-100 shrink-0"
              style={{ boxShadow: "0 1px 4px rgba(132,0,255,0.05)" }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: s.color }}
              />
              <span className="text-xs font-semibold text-dark-amethyst-800">
                {s.label}
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-dark-amethyst-50 text-dark-amethyst-600">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Kanban board ── */}
      <div className="px-6 pb-10 overflow-x-auto">
        <div className="flex gap-4 w-max min-w-full">
          {STAGES.map((stage) => (
            <PipelineColumn
              key={stage.key}
              stage={stage}
              candidates={byStage(stage.key)}
              onDragStart={handleDragStart}
              draggingCandidate={draggingCandidate}
              dragOverStage={dragOverStage}
              onDragOver={setDragOverStage}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

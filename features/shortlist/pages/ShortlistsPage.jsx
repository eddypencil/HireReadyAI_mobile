import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useShortlistData } from "../hooks/useShortlistData";
import ShortlistInsightsBar from "../components/ShortlistInsightsBar";
import ShortlistCandidateCard from "../components/ShortlistCandidateCard";
import ShortlistDetailPanel from "../components/ShortlistDetailPanel";

const SORT_OPTIONS = [
  { key: "consensus", label: "Consensus" },
  { key: "ai_score",  label: "AI Score" },
  { key: "name",      label: "Name" },
];

export default function ShortlistsPage({ jobs }) {
  const {
    selectedJobId,
    setSelectedJobId,
    selectedJob,
    sortedEntries,
    loading,
    insightsSummary,
    selectedCandidateId,
    setSelectedCandidateId,
    selectedEntry,
    myVote,
    sortMode,
    setSortMode,
    notes,
    notesLoading,
    castVote,
    rejectApplication,
    advanceToOffer,
    postNote,
  } = useShortlistData(jobs);

  const [search, setSearch] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // On xl+ screen panel is always visible alongside list; on smaller screens it's overlay
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1280);
  useEffect(() => {
    const handler = () => setIsSmallScreen(window.innerWidth < 1280);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleSelectCandidate = (applicationId) => {
    setSelectedCandidateId(applicationId);
    if (isSmallScreen) setIsPanelOpen(true);
  };

  const filteredEntries = sortedEntries.filter((entry) => {
    const name = entry.applications.profiles?.full_name?.toLowerCase() || "";
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden font-sans">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shortlist</h1>
            <p className="text-xs text-gray-500 mt-0.5">Top candidates surfaced by AI · awaiting hiring team decision</p>
          </div>
          {/* Search (right on large screens) */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {/* Job dropdown */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 cursor-pointer"
          >
            <option value="" disabled>Select a job posting</option>
            {jobs?.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>

          {/* Filters (UI only) */}
          <button className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          {/* Sort chips */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-gray-400 mr-1">Sort</span>
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortMode(key)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  sortMode === key
                    ? "bg-dark-amethyst-600 text-white border-dark-amethyst-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-dark-amethyst-300 hover:text-dark-amethyst-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Insights Bar ── */}
      <ShortlistInsightsBar
        insightsSummary={insightsSummary}
        selectedJobTitle={selectedJob?.title}
      />

      {/* ── Main content: list + panel ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Candidate List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-dark-amethyst-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm gap-2">
              <Sparkles className="w-8 h-8 opacity-30" />
              <p>No candidates in this shortlist yet.</p>
            </div>
          ) : (
            filteredEntries.map((entry, idx) => (
              <ShortlistCandidateCard
                key={entry.id}
                entry={entry}
                index={idx}
                isSelected={entry.applications.id === selectedCandidateId}
                onClick={() => handleSelectCandidate(entry.applications.id)}
              />
            ))
          )}
        </div>

        {/* Detail Panel — permanent on xl, overlay on smaller */}
        {selectedEntry && (
          <>
            {/* xl: always visible */}
            {!isSmallScreen && (
              <ShortlistDetailPanel
                entry={selectedEntry}
                myVote={myVote}
                notes={notes}
                notesLoading={notesLoading}
                onClose={() => {}}
                onCastVote={castVote}
                onReject={rejectApplication}
                onAdvanceToOffer={advanceToOffer}
                onPostNote={postNote}
                isOverlay={false}
              />
            )}

            {/* small/medium: slide-in overlay */}
            {isSmallScreen && isPanelOpen && (
              <ShortlistDetailPanel
                entry={selectedEntry}
                myVote={myVote}
                notes={notes}
                notesLoading={notesLoading}
                onClose={() => setIsPanelOpen(false)}
                onCastVote={castVote}
                onReject={rejectApplication}
                onAdvanceToOffer={advanceToOffer}
                onPostNote={postNote}
                isOverlay={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

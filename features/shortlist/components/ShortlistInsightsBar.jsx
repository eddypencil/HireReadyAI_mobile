import { ThumbsUp, ThumbsDown, Minus, Sparkles } from "lucide-react";

export default function ShortlistInsightsBar({ insightsSummary, selectedJobTitle }) {
  const { up, neutral, down, awaitingVote, total } = insightsSummary;
  const topAdvanceCount = Math.max(1, Math.round(total * 0.3));

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-5 text-sm">
        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Up votes <span className="font-bold">{up}</span></span>
        </div>
        <span className="text-gray-300">—</span>
        <div className="flex items-center gap-1.5 text-gray-500 font-medium">
          <Minus className="w-3.5 h-3.5" />
          <span>Neutral <span className="font-bold">{neutral}</span></span>
        </div>
        <span className="text-gray-300">—</span>
        <div className="flex items-center gap-1.5 text-red-400 font-medium">
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>Down votes <span className="font-bold">{down}</span></span>
        </div>
        <span className="text-gray-200 hidden sm:block">|</span>
        <span className="text-gray-500 text-xs hidden sm:block">
          <span className="font-semibold text-gray-800">{total}</span> shortlisted
          {awaitingVote > 0 && (
            <> · <span className="font-semibold text-amber-600">{awaitingVote}</span> awaiting first vote</>
          )}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-mauve-magic-600 bg-mauve-magic-50 border border-mauve-magic-100 px-3 py-1.5 rounded-full">
        <Sparkles className="w-3.5 h-3.5" />
        AI suggests advancing top {topAdvanceCount} to onsite
      </div>
    </div>
  );
}

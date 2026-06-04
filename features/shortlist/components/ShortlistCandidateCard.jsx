import { ThumbsUp, ThumbsDown, Minus, Sparkles, Calendar } from "lucide-react";

const TAG_COLORS = {
  "Strong Fit": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Leaning hire": "bg-sky-50 text-sky-700 border-sky-200",
  "Needs Review": "bg-amber-50 text-amber-700 border-amber-200",
};

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name = "") {
  const colors = [
    "bg-violet-500","bg-sky-500","bg-emerald-500","bg-amber-500",
    "bg-rose-500","bg-indigo-500","bg-teal-500","bg-fuchsia-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
}

export default function ShortlistCandidateCard({ entry, index, isSelected, onClick }) {
  const { applications: app, tags = [], rank } = entry;
  const { profiles: candidate, shortlist_votes: votes = [], composite_score, ai_rationale, applied_at, is_rejected } = app;

  const upVotes = votes.filter((v) => v.vote === "up").length;
  const downVotes = votes.filter((v) => v.vote === "down").length;

  // Show up to 4 voter avatars
  const voterAvatars = votes.slice(0, 4);
  const remainingVoters = Math.max(0, votes.length - 4);

  return (
    <div
      onClick={onClick}
      className={`relative px-5 py-4 cursor-pointer border-b border-gray-100 transition-all group ${
        isSelected
          ? "bg-dark-amethyst-50 border-l-2 border-l-dark-amethyst-500"
          : "bg-white hover:bg-gray-50 border-l-2 border-l-transparent"
      } ${is_rejected ? "opacity-50" : ""}`}
    >
      {/* Rank + Avatar + Name row */}
      <div className="flex items-start gap-3 mb-2.5">
        <span className="text-[10px] font-bold text-gray-400 pt-1 w-5 shrink-0">#{rank}</span>

        <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(candidate?.full_name)}`}>
          {getInitials(candidate?.full_name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${isSelected ? "text-dark-amethyst-900" : "text-gray-900"}`}>
              {candidate?.full_name || "Unknown"}
            </span>
            {is_rejected && (
              <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-200 rounded font-medium">
                Rejected
              </span>
            )}
            {tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600 border-gray-200"}`}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            <Calendar className="w-3 h-3" />
            <span>Applied {timeAgo(applied_at)}</span>
          </div>
        </div>
      </div>

      {/* AI Rationale snippet */}
      {ai_rationale && (
        <div className="flex items-start gap-2 ml-8 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-mauve-magic-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{ai_rationale}</p>
        </div>
      )}

      {/* Footer: voters + score + votes */}
      <div className="flex items-center justify-between ml-8">
        <div className="flex items-center gap-1">
          {voterAvatars.map((v, i) => (
            <div
              key={v.id || i}
              title={v.profiles?.full_name}
              className={`w-6 h-6 rounded-full border-2 border-white text-[9px] font-bold flex items-center justify-center text-white -ml-1.5 first:ml-0 ${getAvatarColor(v.profiles?.full_name)}`}
            >
              {getInitials(v.profiles?.full_name)}
            </div>
          ))}
          {remainingVoters > 0 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 text-[9px] font-bold flex items-center justify-center text-gray-600 -ml-1.5">
              +{remainingVoters}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-medium text-gray-700">
            AI match{" "}
            <span className={`font-bold px-1.5 py-0.5 rounded ${
              composite_score >= 80 ? "bg-emerald-50 text-emerald-700" :
              composite_score >= 65 ? "bg-amber-50 text-amber-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {composite_score || "—"}
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-emerald-600">
              <ThumbsUp className="w-3 h-3" /> {upVotes}
            </span>
            <span className="text-gray-300">—</span>
            <span className="flex items-center gap-0.5 text-red-400">
              <ThumbsDown className="w-3 h-3" /> {downVotes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

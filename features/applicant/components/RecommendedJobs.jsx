// /components/applicant/RecommendedJobs.jsx
const recommended = [
  {
    title: "Backend Engineer · Payments",
    company: "Paymob",
    location: "Cairo · Hybrid",
    match: 92,
  },
  {
    title: "Platform Engineer",
    company: "Tabby",
    location: "Riyadh · Onsite",
    match: null,
  },
  {
    title: "Senior Node Developer",
    company: "Swvl",
    location: "Remote · MENA",
    match: 87,
  },
];

export default function RecommendedJobs() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
      <h2 className="font-semibold text-gray-800 text-lg">
        Recommended for you
      </h2>

      {recommended.map((r, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0"
        >
          <div>
            <p className="font-medium text-gray-800">{r.title}</p>
            <p className="text-xs text-gray-500">{r.company}</p>
            {r.location && (
              <p className="text-xs text-gray-400 mt-0.5">{r.location}</p>
            )}
          </div>

          {r.match ? (
            <div className="text-right">
              <span className="text-violet-600 text-sm font-bold">
                {r.match}%
              </span>
              <button className="block text-xs text-gray-400 hover:text-violet-500 mt-1">
                View role &gt;
              </button>
            </div>
          ) : (
            <button className="text-xs text-violet-500 font-medium border border-violet-200 px-3 py-1 rounded-full hover:bg-violet-50">
              View role
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

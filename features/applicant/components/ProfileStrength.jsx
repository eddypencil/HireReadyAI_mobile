// /components/applicant/ProfileStrength.jsx
export default function ProfileStrength() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-gray-800 text-lg">
          Profile strength
        </h2>
        <span className="text-2xl font-bold text-violet-600">72</span>
      </div>
      <p className="text-sm text-gray-500 -mt-1 mb-2">
        Complete profile = better matches
      </p>

      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className="bg-violet-500 h-2.5 rounded-full w-[72%]" />
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p className="text-gray-600">✅ CV uploaded</p>
        <p className="text-gray-600">✅ Work experience</p>
        <p className="text-amber-600">⚠️ Add portfolio links</p>
        <p className="text-amber-600">⚠️ Add 5+ skills</p>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        4 things left to complete profile
      </p>
    </div>
  );
}

// /components/applicant/FeedbackTips.jsx
export default function FeedbackTips() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-gray-800 text-lg">Feedback & tips</h2>
      <p className="text-sm text-gray-500 mb-3">From your last submission</p>

      <div className="space-y-3">
        <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
          <div className="flex items-center gap-2">
            <span className="text-violet-600 text-sm font-bold">87%</span>
            <span className="text-sm font-medium text-gray-700">
              Strong pattern recognition
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            You scored in the top 15% for logical sequences.
          </p>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-sm font-bold">
              ⏱️ Pacing could improve
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Try not to spend more than 90s per question on the next test.
          </p>
        </div>
      </div>
    </div>
  );
}

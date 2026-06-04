//src/features/applications/components/apply/QuestionCard.jsx
export default function QuestionCard({ question, value, onChange, error }) {
  return (
    <div className="border rounded-lg p-4 bg-white space-y-2">
      <p className="font-medium">
        {question.question}
        <span className="text-red-500 ml-1">*</span>
      </p>

      {question.type === "yes_no" && (
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              checked={value === "yes"}
              onChange={() => onChange("yes")}
            />
            Yes
          </label>

          <label>
            <input
              type="radio"
              checked={value === "no"}
              onChange={() => onChange("no")}
            />
            No
          </label>
        </div>
      )}

      {question.type === "text" && (
        <input
          className={`w-full p-2 rounded border ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "textarea" && (
        <textarea
          className={`w-full p-2 rounded border ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

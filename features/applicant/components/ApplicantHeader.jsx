// /components/applicant/ApplicantHeader.jsx
export default function ApplicantHeader(props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">HireReadyAI</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {props.fullName}</p>
        <p className="text-xs text-amber-600 mt-1 font-medium">
          You have 1 action waiting · keep your momentum.
        </p>
      </div>

      <div className="text-sm text-gray-600 font-medium bg-gray-50 px-4 py-2 rounded-full">
        Your applications
      </div>
    </div>
  );
}

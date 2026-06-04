import { APPLICATION_STAGE } from "@/shared/constants/enums";

export default function StatsCards({ applications }) {
  const stats = [
    { label: "Applications", value: applications?.length || 0 },
    { label: "Interviews", value: applications?.filter((a) => a.current_stage === APPLICATION_STAGE.interview).length || 0 },
    { label: "Offers", value: applications?.filter((a) => a.current_stage === APPLICATION_STAGE.hired).length || 0 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-sm text-gray-500">{s.label}</p>
          <h2 className="text-2xl font-bold text-gray-800">{s.value}</h2>
        </div>
      ))}
    </div>
  );
}

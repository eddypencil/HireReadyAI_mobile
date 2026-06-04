import React from "react";
import { Briefcase, Users, CheckCircle, XCircle } from "lucide-react";

export default function DashboardStats({ stats }) {
  const cards = [
    {
      label: "Total Jobs",
      value: stats.totalJobs,
      icon: <Briefcase className="w-5 h-5 text-dark-amethyst-600" />,
      bgColor: "bg-white",
      borderColor: "border-dark-amethyst-200",
      textColor: "text-dark-amethyst-950",
    },
    {
      label: "Total Applicants",
      value: stats.totalApplicants,
      icon: <Users className="w-5 h-5 text-dark-amethyst-500" />,
      bgColor: "bg-white",
      borderColor: "border-dark-amethyst-200",
      textColor: "text-dark-amethyst-950",
    },
    {
      label: "Accepted",
      value: stats.totalAccepted,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      bgColor: "bg-white",
      borderColor: "border-green-200",
      textColor: "text-dark-amethyst-950",
    },
    {
      label: "Rejected",
      value: stats.totalRejected,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      bgColor: "bg-white",
      borderColor: "border-red-200",
      textColor: "text-dark-amethyst-950",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 font-sans">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow duration-200`}
        >
          <div>
            <p className="text-dark-amethyst-400 text-sm font-medium mb-1 tracking-wide">
              {card.label}
            </p>
            <h3 className={`text-3xl font-bold ${card.textColor}`} style={{ fontFamily: "'Inter', sans-serif" }}>
              {card.value}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-dark-amethyst-50 flex items-center justify-center">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

import React from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardCharts({ pipelineSummaryData, trendData, topJobsData }) {
  const calcPct = (val) => {
    if (!pipelineSummaryData || pipelineSummaryData.applied === 0) return 0;
    return Math.round((val / pipelineSummaryData.applied) * 100);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 font-sans">
      {/* Pipeline Summary Component */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 col-span-1 lg:col-span-2 xl:col-span-1">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              Pipeline summary
            </h3>
            <p className="text-sm text-[#64748b]">
              Across all active roles · last 7 days
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-dark-amethyst-600 bg-dark-amethyst-50 border border-dark-amethyst-200">
            Live
          </span>
        </div>

        {pipelineSummaryData && (
          <div className="flex gap-2 mb-8">
            {[
              { label: "Applied", value: pipelineSummaryData.applied, pct: 100 },
              { label: "Screened", value: pipelineSummaryData.screened, pct: calcPct(pipelineSummaryData.screened) },
              { label: "Testing", value: pipelineSummaryData.testing, pct: calcPct(pipelineSummaryData.testing) },
              { label: "Interviewed", value: pipelineSummaryData.interviewed, pct: calcPct(pipelineSummaryData.interviewed) },
              { label: "Shortlisted", value: pipelineSummaryData.shortlisted, pct: calcPct(pipelineSummaryData.shortlisted) },
            ].map((stage, idx) => (
              <div key={idx} className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#64748b]">{stage.label}</span>
                  {idx > 0 && <span className="text-xs font-semibold text-[#0f172a]">{stage.pct}%</span>}
                </div>
                <span className="text-2xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {stage.value}
                </span>
                <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-dark-amethyst-500 rounded-full transition-all duration-500" 
                    style={{ width: `${stage.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trend Area Chart */}
        <div className="h-[200px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8400ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8400ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                tickCount={5}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="applications" 
                stroke="#8400ff" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorApps)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Jobs Chart */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-dark-amethyst-950" style={{ fontFamily: "'Inter', sans-serif" }}>
            Top Jobs by Applicants
          </h3>
          <p className="text-sm text-gray-500">
            Most active job postings
          </p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topJobsData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 11 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="applicants" fill="#ce99ff" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import DashboardStats from "../components/DashboardStats";
import DashboardCharts from "../components/DashboardCharts";
import DashboardJobsTable from "../components/DashboardJobsTable";

export default function RecruiterDashboardPage() {
  const { jobs, stats, pipelineSummaryData, trendData, topJobsData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64 font-sans">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-dark-amethyst-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-dark-amethyst-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 font-sans">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          Failed to load dashboard data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold text-dark-amethyst-950 mb-2 tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-dark-amethyst-400">
            Overview of your active job postings and applicants.
          </p>
        </div>

        <DashboardStats stats={stats} />
        
        {pipelineSummaryData && topJobsData.length > 0 && (
          <DashboardCharts 
            pipelineSummaryData={pipelineSummaryData} 
            trendData={trendData} 
            topJobsData={topJobsData} 
          />
        )}
        
        <DashboardJobsTable jobs={jobs} />
      </div>
    </div>
  );
}

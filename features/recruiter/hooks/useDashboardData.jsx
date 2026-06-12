import { useState, useEffect } from "react";
import { fetchDashboardData } from "../services/dashboard.service";
import { APPLICATION_STAGE } from "../../../shared/constants/enums";
import { useUser } from "../../auth/context/user.context";
import { useCompany } from "../../companies/pages/CompanyLayout";
import { useRealtimeRecruiter } from "../../../shared/hooks/useRealtime";

export const useDashboardData = () => {
  const { profile } = useUser();
  const { company } = useCompany();
  const { newApplicationsCount, pipelineRefreshKey, clearNewApplications } =
    useRealtimeRecruiter(company?.id);
  const [jobs, setJobs] = useState([]);
  const [pipelineData, setPipelineData] = useState([]);
  const [pipelineSummaryData, setPipelineSummaryData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [topJobsData, setTopJobsData] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalActiveJobs: 0,
    totalApplicants: 0,
    totalInterviewed: 0,
    totalWaitingAction: 0,
    totalAccepted: 0,
    totalRejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!profile?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchDashboardData(profile.id);

        if (data && data.length > 0) {
          // Process jobs data
          const processedJobs = data.map(job => {
            const apps = job.applications || [];

            let testedCount = 0;
            let interviewCount = 0;
            let waitingActionCount = 0;
            let shortlistedCount = 0;

            apps.forEach(app => {
              // Not applied or screening means it's tested
              if (
                app.current_stage !== APPLICATION_STAGE.applied &&
                app.current_stage !== APPLICATION_STAGE.screening
              ) {
                testedCount++;
              }

              // Waiting action = interviewed
              if (app.current_stage === APPLICATION_STAGE.interviewed) {
                waitingActionCount++;
              }

              // Shortlisted = short_listed
              if (app.current_stage === APPLICATION_STAGE.shorListed) {
                shortlistedCount++;
              }

              // Interview count = has an interview record
              if (app.interviews) {
                interviewCount++;
              }
            });

            return {
              id: job.id,
              job_title: job.title,
              company_id: job.companies?.id || "",
              company: job.companies?.name || "Unknown Company",
              applicants_count: apps.length,
              tested_count: testedCount,
              interview_count: interviewCount,
              waiting_action_count: waitingActionCount,
              shortlisted_count: shortlistedCount,
            };
          });

          setJobs(processedJobs);

          // Process stats
          const totalJobs = data.length;
          const totalActiveJobs = data.filter(j => !j.closed_at).length;

          let totalApplicants = 0;
          let totalInterviewed = 0;
          let totalWaitingAction = 0;
          let totalAccepted = 0;
          let totalRejected = 0;
          let totalScreened = 0;
          let totalTested = 0;

          // Prepare trend data map for last 7 days
          const trendMap = {};
          const trendArray = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            trendMap[dayName] = 0;
            trendArray.push({ day: dayName });
          }

          data.forEach(job => {
            const apps = job.applications || [];
            totalApplicants += apps.length;
            apps.forEach(app => {
              if (app.interviews) totalInterviewed++;
              if (app.current_stage === APPLICATION_STAGE.interviewed) totalWaitingAction++;
              if (app.current_stage === APPLICATION_STAGE.hired) totalAccepted++;
              if (app.current_stage === APPLICATION_STAGE.shorListed) totalAccepted++; // Map shortlisted to accepted metric for stats
              if (app.current_stage === APPLICATION_STAGE.rejected) totalRejected++;

              if (app.current_stage !== APPLICATION_STAGE.applied) totalScreened++;
              if (app.current_stage !== APPLICATION_STAGE.applied && app.current_stage !== APPLICATION_STAGE.screening) totalTested++;

              if (app.applied_at) {
                const date = new Date(app.applied_at);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                // Only count if it's within our prepared 7 days (simplified check)
                if (trendMap[dayName] !== undefined) {
                  const now = new Date();
                  const diffTime = now.getTime() - date.getTime();
                  const diffDays = diffTime / (1000 * 60 * 60 * 24);
                  if (diffDays <= 7) {
                    trendMap[dayName]++;
                  }
                }
              }
            });
          });

          // Fill trend array
          const finalTrendData = trendArray.map(item => ({
            day: item.day,
            applications: trendMap[item.day]
          }));
          setTrendData(finalTrendData);

          setPipelineSummaryData({
            applied: totalApplicants,
            screened: totalScreened,
            testing: totalTested,
            interviewed: totalInterviewed,
            shortlisted: totalAccepted
          });

          setStats({
            totalJobs,
            totalActiveJobs,
            totalApplicants,
            totalInterviewed,
            totalWaitingAction,
            totalAccepted,
            totalRejected
          });

          setPipelineData([
            { name: "Applicants", count: totalApplicants, fill: "#8400ff" },
            { name: "Interviewed", count: totalInterviewed, fill: "#4f0099" },
            { name: "Waiting", count: totalWaitingAction, fill: "#ce99ff" },
            { name: "Accepted", count: totalAccepted, fill: "#22c55e" },
            { name: "Rejected", count: totalRejected, fill: "#ef4444" },
          ]);

          const sortedJobs = [...data].sort((a, b) => (b.applications?.length || 0) - (a.applications?.length || 0));
          setTopJobsData(
            sortedJobs.slice(0, 5).map(job => ({
              name: job.title.length > 15 ? job.title.substring(0, 15) + "..." : job.title,
              applicants: job.applications?.length || 0
            }))
          );
        }

      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  // pipelineRefreshKey increments when realtime detects a change → auto-reload
  }, [profile?.id, pipelineRefreshKey]);

  return { jobs, stats, pipelineData, pipelineSummaryData, trendData, topJobsData, isLoading, error, newApplicationsCount, clearNewApplications };
};

import { useEffect } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useApplications } from "@/features/applications/context/application.context";
import ApplicantHeader from "../components/ApplicantHeader";
import StatsCards from "../components/StatsCards";
import ApplicationsList from "../components/ApplicationsList";
import RecommendedJobs from "../components/RecommendedJobs";
import ProfileStrength from "../components/ProfileStrength";
import FeedbackTips from "../components/FeedbackTips";
import InterviewsList from "../components/InterviewList";

export default function ApplicantPage() {
  const { profile, user } = useUser();
  const {
    loading,
    applications,
    error,
    getAllApplications,
    updateApplicationStage,
  } = useApplications();

  const { signOutUser } = useUser();

  useEffect(() => {
    if (user?.id) {
      getAllApplications(user.id);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-slate-500 text-sm">Loading applications...</p>
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 p-6 space-y-6 font-sans">
      <ApplicantHeader {...profile} />
      <StatsCards applications={applications} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ApplicationsList applications={applications} />

          <InterviewsList
            applications={applications}
            onStageUpdated={(appId, newStage) => {
              updateApplicationStage(appId, newStage);
            }}
          />

          <FeedbackTips />
        </div>

        <div className="space-y-6">
          <ProfileStrength />
          <RecommendedJobs />
        </div>
        {/* <button
          className="fixed bottom-2 right-2 bg-dark-amethyst-600 text-royal-violet-100 px-5 py-2 rounded-2xl cursor-pointer"
          onClick={() => {
            signOutUser();
          }}
        >
          LogOut
        </button> */}
      </div>
    </div>
  );
}

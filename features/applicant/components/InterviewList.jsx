import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";

const stageConfig = {
    [APPLICATION_STAGE.interview]: { label: "Active Interview", color: "bg-indigo-100 text-indigo-700 border-indigo-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.shortlisted]: { label: "Shortlisted", color: "bg-purple-100 text-purple-700 border-purple-200" },
    [APPLICATION_STAGE.hired]: { label: "Hired / Completed", color: "bg-green-100 text-green-700 border-green-200" },
    [APPLICATION_STAGE.rejected]: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },
};

function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

export default function InterviewList({ applications }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all_interviews");

    const interviewProcesses = applications?.filter((app) =>
        app.current_stage === APPLICATION_STAGE.interview ||
        app.current_stage === APPLICATION_STAGE.shortlisted ||
        app.current_stage === APPLICATION_STAGE.hired ||
        app.current_stage === APPLICATION_STAGE.rejected
    ) || [];

    if (interviewProcesses.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
                <h2 className="font-semibold text-gray-800 text-lg">Status Management</h2>
                <p className="text-sm text-gray-400 mt-1">No interview processes or status updates records found yet.</p>
            </div>
        );
    }

    const countAll = interviewProcesses.length;
    const countInterviews = interviewProcesses.filter(app => app.current_stage === APPLICATION_STAGE.interview).length;
    const countCompleted = interviewProcesses.filter(app => app.current_stage === APPLICATION_STAGE.hired).length;
    const countRejected = interviewProcesses.filter(app => app.current_stage === APPLICATION_STAGE.rejected).length;

    const filteredInterviews = interviewProcesses.filter((app) => {
        if (activeTab === "all_interviews") return true;
        if (activeTab === "interview") return app.current_stage === APPLICATION_STAGE.interview;
        if (activeTab === "completed") return app.current_stage === APPLICATION_STAGE.hired;
        if (activeTab === "rejected") return app.current_stage === APPLICATION_STAGE.rejected;
        return true;
    });

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
                <h2 className="font-semibold text-gray-800 text-lg">Status Management</h2>
                <p className="text-sm text-gray-500 mt-0.5">Track your interview stages and process results</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                <button
                    onClick={() => setActiveTab("all_interviews")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "all_interviews" ? "bg-slate-900 text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                >
                    All Processes - {countAll}
                </button>
                <button
                    onClick={() => setActiveTab("interview")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "interview" ? "bg-indigo-600 text-white shadow-sm" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                >
                    Active Interviews - {countInterviews}
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "completed" ? "bg-green-600 text-white shadow-sm" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                >
                    Completed - {countCompleted}
                </button>
                <button
                    onClick={() => setActiveTab("rejected")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "rejected" ? "bg-red-600 text-white shadow-sm" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                >
                    Rejected - {countRejected}
                </button>
            </div>

            <div className="space-y-4">
                {filteredInterviews.length === 0 ? (
                    <p className="text-sm text-gray-400 py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No records found in this section.
                    </p>
                ) : (
                    filteredInterviews.map((app) => {
                        console.log(app)
                        const job = app.job_postings;
                        const company = job?.companies;
                        const currentStage = app.current_stage;
                        const stageStyle = stageConfig[currentStage] || { label: currentStage, color: "bg-gray-100 text-gray-700" };

                        return (
                            <div
                                key={app.id}
                                className="bg-gray-50/60 border border-gray-100 rounded-xl p-5 shadow-xs hover:shadow-sm hover:border-violet-200 hover:bg-white transition-all duration-200 flex items-center justify-between flex-wrap gap-4"
                            >
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-semibold text-gray-800 text-base tracking-tight">
                                            {job?.title || "Unknown Position"}
                                        </h4>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stageStyle.color}`}>
                                            {stageStyle.label}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 font-medium">
                                        {company?.name || "Unknown Company"}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="bg-gray-200/70 px-2 py-0.5 rounded text-[11px] font-mono text-gray-500">
                                            ID: {app.candidate_profile_id.substring(0, 8)}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>Applied {formatDate(app.applied_at)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {currentStage === APPLICATION_STAGE.interview && (
                                        <button
                                            onClick={() => navigate(`/interview/${app.id}`,)}
                                            className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs hover:bg-indigo-700 transition-all"
                                        >
                                            Start AI Interview
                                        </button>
                                    )}
                                    {app.cv_file_url && (
                                        <a
                                            href={app.cv_file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-violet-600 text-xs font-semibold bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-xs hover:border-violet-300 hover:bg-violet-50/50 transition-all"
                                        >
                                            View Submitted CV
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateJobPosting } from "../services/companies.service";
import { getPipeline } from "../../pipeline/services/pipeline.service";

import JobSidebar from "../components/job-postings/JobSidebar";
import JobDetailHeader from "../components/job-postings/JobDetailHeader";
import JobInfoGrid from "../components/job-postings/JobInfoGrid";
import JobContentCards from "../components/job-postings/JobContentCards";
import JobPipelinePreview from "../components/job-postings/JobPipelinePreview";

export default function JobPostings({ jobs, searchQuery }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Open");
  const [localJobs, setLocalJobs] = useState(jobs);
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [pipelineStages, setPipelineStages] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);

  // Sync local jobs with props
  useEffect(() => {
    setLocalJobs(jobs);
    if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const selectedJob = localJobs.find((j) => j.id === selectedJobId) || localJobs[0];

  // Fetch pipeline for selected job
  useEffect(() => {
    if (!selectedJobId) return;
    const fetchStages = async () => {
      setLoadingStages(true);
      try {
        const pipeline = await getPipeline(selectedJobId);
        setPipelineStages(pipeline?.recruitment_stages || []);
      } catch (err) {
        console.error("Failed to load pipeline stages", err);
        setPipelineStages([]);
      } finally {
        setLoadingStages(false);
      }
    };
    fetchStages();
  }, [selectedJobId]);

  // Handle Edit Initialization
  const handleEditClick = () => {
    setEditForm({ ...selectedJob });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      // Prepare updates
      const updates = {
        title: editForm.title,
        description: editForm.description,
        job_type: editForm.job_type,
        work_location: editForm.work_location,
        salary_min: editForm.salary_min,
        salary_max: editForm.salary_max,
        seniority_level: editForm.seniority_level,
        responsibilities: editForm.responsibilities,
        requirements: editForm.requirements,
        skills: editForm.skills,
      };

      const updatedJob = await updateJobPosting(selectedJobId, updates);
      
      // Update local state
      setLocalJobs((prev) =>
        prev.map((job) => (job.id === selectedJobId ? { ...job, ...updatedJob } : job))
      );
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update job", err);
      alert("Failed to update job details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full font-sans bg-gray-50/50">
      {/* Left Sidebar - Job List */}
      <JobSidebar 
        jobs={localJobs}
        activeTab={activeTab}
        searchQuery={searchQuery}
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
        setIsEditing={setIsEditing}
        navigate={navigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Detail View */}
      <div className="flex-1 bg-white h-full md:overflow-y-auto">
        {!selectedJob ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Select a job to view details
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6 lg:p-10 pb-24">
            
            <JobDetailHeader 
              selectedJob={selectedJob}
              isEditing={isEditing}
              editForm={editForm}
              setEditForm={setEditForm}
              handleEditClick={handleEditClick}
              handleCancelEdit={handleCancelEdit}
              handleSave={handleSave}
              saving={saving}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />

            <JobInfoGrid 
              selectedJob={selectedJob}
              isEditing={isEditing}
              editForm={editForm}
              setEditForm={setEditForm}
            />

            <div className="space-y-6">
              <JobContentCards 
                selectedJob={selectedJob}
                isEditing={isEditing}
                editForm={editForm}
                setEditForm={setEditForm}
              />

              <JobPipelinePreview 
                pipelineStages={pipelineStages}
                loadingStages={loadingStages}
                selectedJobId={selectedJobId}
                selectedJobTitle={selectedJob.title}
                navigate={navigate}
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
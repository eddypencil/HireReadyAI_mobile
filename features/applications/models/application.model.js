//src\features\applications\models\application.model.js
class Application {
  constructor(candidateProfileId, jobId, cvFileUrl, currentStage) {
    this.candidateProfileId = candidateProfileId;
    this.jobId = jobId;
    this.cvFileUrl = cvFileUrl;
    this.currentStage = currentStage;
  }

  toSupabaseForm() {
    return {
      candidate_profile_id: this.candidateProfileId,
      job_id: this.jobId,
      cv_file_url: this.cvFileUrl,
      current_stage: this.currentStage,
    };
  }
}

export default Application;

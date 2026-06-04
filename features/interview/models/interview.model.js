class InterviewModel {
  constructor(applicationId, jobId, state, inviteSentAt, reRecordMinutes) {
    this.applicationId = applicationId;
    this.jobId = jobId;
    this.state = state;
    this.inviteSentAt = inviteSentAt;
    this.reRecordMinutes = reRecordMinutes;
  }

  toSupabaseForm() {
    const form = {
      application_id: this.applicationId,
      job_id: this.jobId,
      status: this.state,
      re_record_window_minutes: this.reRecordMinutes,
    };
    if (this.inviteSentAt) {
      form.invite_sent_at = this.inviteSentAt;
    }
    return form;
  }
}

export default InterviewModel;

export const USER_ROLE = Object.freeze({
  applicant: "applicant",
  recruiter: "recruiter",
  hrManager: "hr_manager",
});

// intern, junior, mid, senior, lead
export const SENIORITY_LEVEL = Object.freeze({
  intern: "intern",
  junior: "junior",
  mid: "mid",
  senior: "senior",
  lead: "lead",
});

export const APPLICATION_STAGE = Object.freeze({
  applied: "applied",
  screening: "screening",
  interviewed: "interviewed",
  interview: "interview",
  hired: "hired",
  rejected: "rejected",
  shorListed: "short_listed"
});

export const JOB_TYPE = Object.freeze({
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  FREELANCE: "freelance",
});

export const INTERVIEW_STATUS = Object.freeze({
  draft: "draft",
  scheduled: "scheduled",
  completed: "completed",
  cancelled: "cancelled",
});

export const USER_ROLE = Object.freeze({
  applicant: "applicant",
  recruiter: "recruiter",
  hrManager: "hr_manager",
  admin: "admin",
});

export const MEMBERSHIP_PERMISSION = Object.freeze({
  pending: "pending",
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
  shorListed: "short_listed",

  cv_screening: "cv_screening",
  ai_screening: "ai_screening",
  assessment_test: "assessment_test",
  coding_test: "coding_test",
  video_interview: "video_interview",
  technical_interview: "technical_interview",
  hr_interview: "hr_interview",
  manager_interview: "manager_interview",
  background_check: "background_check",
  offer: "offer",
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

export const ACCOUNT_STATUS = Object.freeze({
  active: "active",
  frozen: "frozen",
  banned: "banned",
  flaggedForReview: "flagged_for_review",
});

export const USER_ACTION_TYPE = Object.freeze({
  warn: "warn",
  freeze: "freeze",
  ban: "ban",
  active: "active",
});

export const REPORT_TYPE = Object.freeze({
  company: "company",
  user: "user",
  interview: "interview",
  question: "question",
});

export const REPORT_SEVERITY = Object.freeze({
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
});

export const REPORT_STATUS = Object.freeze({
  pending: "pending",
  investigating: "investigating",
  resolved: "resolved",
  dismissed: "dismissed",
});

export const TECHNICAL_ISSUE_STATUS = Object.freeze({
  pending: "pending",
  underDevelopment: "under_development",
  resolved: "resolved",
});

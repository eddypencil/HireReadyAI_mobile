export const STAGE_LIBRARY = [
  {
    key: "cv_screening",
    label: "CV Screening",
    subtitle: "Resume parsing & match",
    icon: "FileText",
    isPremium: false,
    comingSoon: true,
  },
  {
    key: "ai_screening",
    label: "AI Screening",
    subtitle: "AI shortlist & scoring",
    icon: "Sparkles",
    isPremium: false,
    comingSoon: true,
  },
  {
    key: "assessment_test",
    label: "Assessment Test",
    subtitle: "Skill assessment",
    icon: "ClipboardList",
    isPremium: true,
  },
  {
    key: "coding_test",
    label: "Coding Test",
    subtitle: "Live coding challenge",
    icon: "Code2",
    isPremium: true,
  },
  {
    key: "video_interview",
    label: "Video Interview",
    subtitle: "Async video questions",
    icon: "Video",
    isPremium: false,
    comingSoon: true,
  },
  {
    key: "technical_interview",
    label: "Technical Interview",
    subtitle: "Engineer-led panel",
    icon: "Cpu",
    isPremium: false,
  },
  {
    key: "hr_interview",
    label: "HR Interview",
    subtitle: "Culture & motivation",
    icon: "Users",
    isPremium: false,
  },
  {
    key: "manager_interview",
    label: "Manager Interview",
    subtitle: "Final approval call",
    icon: "UserCheck",
    isPremium: false,
    comingSoon: true,
  },
  {
    key: "background_check",
    label: "Background Check",
    subtitle: "Verify credentials",
    icon: "ShieldCheck",
    isPremium: true,
    comingSoon: true,
  },
  {
    key: "offer",
    label: "Offer",
    subtitle: "Send & track offer letter",
    icon: "Award",
    isPremium: false,
    comingSoon: true,
  },
];

export const STAGE_TYPE_OPTIONS = STAGE_LIBRARY
  .filter((s) => !s.comingSoon)
  .map((s) => ({
    value: s.key,
    label: s.label,
    isPremium: s.isPremium,
  }));

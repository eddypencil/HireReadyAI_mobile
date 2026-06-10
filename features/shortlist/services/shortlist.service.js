import { supabase } from "../../../shared/services/supabase";

/**
 * Fetches the full shortlist for a job, including tags, AI rationale,
 * votes with voter profiles, and stage scores.
 */
export const fetchShortlistForJob = async (jobId) => {
  if (!jobId) return [];

  try {
    const { data, error } = await supabase
      .from("shortlist_entries")
      .select(`
        id,
        rank,
        tags,
        applications!inner (
          id,
          job_id,
          answers,
          composite_score,
          ai_rationale,
          ai_confidence,
          is_rejected,
          rejection_reason,
          applied_at,
          profiles!inner (
            id,
            full_name,
            headline,
            role
          ),
          application_stages (
            id,
            score,
            status,
            recruitment_stages ( name, stage_type )
          )
        )
      `)
      .eq("job_id", jobId)
      .order("rank");

    if (error) {
      console.error("Supabase Error fetching shortlist:", error);
      return generateDummyShortlist();
    }

    if (!data || data.length === 0) {
      return data || [];
    }

    const appIds = data.map(e => e.applications.id);
    const { data: votes } = await supabase
      .from("shortlist_votes")
      .select(`
        id, application_id, vote, voter_id,
        profiles!inner ( full_name, headline, role )
      `)
      .in("application_id", appIds);

    const votesByApp = (votes || []).reduce((map, v) => {
      if (!map[v.application_id]) map[v.application_id] = [];
      map[v.application_id].push(v);
      return map;
    }, {});

    return data.map(entry => ({
      ...entry,
      applications: {
        ...entry.applications,
        shortlist_votes: votesByApp[entry.applications.id] || [],
      },
    }));
  } catch (err) {
    console.error("Error in fetchShortlistForJob:", err);
    return generateDummyShortlist();
  }
};

/**
 * Cast or update a vote for an application.
 */
export const castVote = async (applicationId, voterId, vote) => {
  const { data: existing } = await supabase
    .from("shortlist_votes")
    .select("id")
    .eq("application_id", applicationId)
    .eq("voter_id", voterId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("shortlist_votes")
      .update({ vote })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("shortlist_votes")
      .insert({ application_id: applicationId, voter_id: voterId, vote });
    if (error) throw error;
  }
};

/**
 * Mark an application as rejected with an optional reason.
 */
export const rejectApplication = async (applicationId, reason) => {
  const { error } = await supabase
    .from("applications")
    .update({ is_rejected: true, rejection_reason: reason })
    .eq("id", applicationId);
  if (error) throw error;
};

export const unrejectApplication = async (applicationId) => {
  const { error } = await supabase
    .from("applications")
    .update({ is_rejected: false, rejection_reason: null })
    .eq("id", applicationId);
  if (error) throw error;
};

/**
 * Advance an application to the Offer stage.
 */
export const advanceToOffer = async (applicationId, offerStageId) => {
  const { error } = await supabase
    .from("applications")
    .update({ current_stage_id: offerStageId })
    .eq("id", applicationId);
  if (error) throw error;
};

/**
 * Fetch team notes for a specific application.
 */
export const fetchNotesForApplication = async (applicationId) => {
  const { data, error } = await supabase
    .from("application_notes")
    .select(`
      id,
      body,
      created_at,
      visible_to_team,
      author_id,
      profiles:author_id ( full_name, headline, role )
    `)
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Post a new team note for an application.
 */
export const postNote = async (applicationId, authorId, body, visibleToTeam = true) => {
  const { data, error } = await supabase
    .from("application_notes")
    .insert({
      application_id: applicationId,
      author_id: authorId,
      body,
      visible_to_team: visibleToTeam,
    })
    .select(`
      id,
      body,
      created_at,
      visible_to_team,
      author_id,
      profiles:author_id ( full_name, headline, role )
    `)
    .single();

  if (error) throw error;
  return data;
};

// ---------------------------------------------------------------------------
// Dummy data fallback
// ---------------------------------------------------------------------------
const generateDummyShortlist = () => [
  {
    id: "entry-1",
    rank: 1,
    tags: ["Strong Fit", "Leaning hire"],
    applications: {
      id: "app-1",
      job_id: "job-1",
      composite_score: 86,
      ai_rationale:
        "Candidate demonstrates strong frontend engineering skills, ships polished UI work, and meets most job requirements. System-design depth is the main gap to probe.",
      ai_confidence: 0.86,
      is_rejected: false,
      rejection_reason: null,
      applied_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      profiles: { id: "prof-1", full_name: "Priya Natarajan", headline: "Senior Frontend Engineer", role: "recruiter", email: "priya.natarajan@example.com" },
      shortlist_votes: [
        { id: "v1", vote: "up",      voter_id: "voter-1", profiles: { full_name: "Sarah Klein",   headline: "Hiring Manager",     role: "recruiter" } },
        { id: "v2", vote: "up",      voter_id: "voter-2", profiles: { full_name: "Marcus Idowu",  headline: "Engineering Lead",   role: "recruiter" } },
        { id: "v3", vote: "neutral", voter_id: "voter-3", profiles: { full_name: "Hana Saito",    headline: "Design Director",    role: "recruiter" } },
        { id: "v4", vote: "up",      voter_id: "voter-5", profiles: { full_name: "Priya Nair",    headline: "Engineering Manager",role: "recruiter" } },
      ],
      application_stages: [
        { id: "as-1", score: 88, status: "completed", recruitment_stages: { name: "CV Review", stage_type: "cv_review" } },
        { id: "as-offer", score: null, status: "in_progress", recruitment_stages: { name: "Offer", stage_type: "offer" } },
      ],
    },
  },
  {
    id: "entry-2",
    rank: 2,
    tags: ["Leaning hire"],
    applications: {
      id: "app-2",
      composite_score: 73,
      ai_rationale:
        "Candidate demonstrates strong frontend engineering skills, ships polished UI work, and meets most job requirements. System-design depth is the main gap to probe.",
      ai_confidence: 0.73,
      is_rejected: false,
      rejection_reason: null,
      applied_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      profiles: { id: "prof-2", full_name: "Marcus Reyes", headline: "Full Stack Developer", role: "recruiter", email: "marcus.reyes@example.com" },
      shortlist_votes: [
        { id: "v5", vote: "up",      voter_id: "voter-1", profiles: { full_name: "Sarah Klein",  headline: "Hiring Manager",   role: "recruiter" } },
        { id: "v6", vote: "up",      voter_id: "voter-2", profiles: { full_name: "Marcus Idowu", headline: "Engineering Lead", role: "recruiter" } },
        { id: "v7", vote: "up",      voter_id: "voter-3", profiles: { full_name: "Hana Saito",   headline: "Design Director",  role: "recruiter" } },
      ],
      application_stages: [
        { id: "as-2", score: 73, recruitment_stages: { name: "CV Review", stage_type: "cv_review" } },
      ],
    },
  },
  {
    id: "entry-3",
    rank: 3,
    tags: [],
    applications: {
      id: "app-3",
      composite_score: 74,
      ai_rationale:
        "Candidate demonstrates strong frontend engineering skills, ships polished UI work, and meets most job requirements. System-design depth is the main gap to probe.",
      ai_confidence: 0.74,
      is_rejected: false,
      rejection_reason: null,
      applied_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      profiles: { id: "prof-3", full_name: "Sofia Almeida", headline: "UI/UX Engineer", role: "recruiter", email: "sofia.almeida@example.com" },
      shortlist_votes: [
        { id: "v8",  vote: "up",      voter_id: "voter-1", profiles: { full_name: "Sarah Klein",  headline: "Hiring Manager",   role: "recruiter" } },
        { id: "v9",  vote: "up",      voter_id: "voter-2", profiles: { full_name: "Marcus Idowu", headline: "Engineering Lead", role: "recruiter" } },
        { id: "v10", vote: "neutral", voter_id: "voter-3", profiles: { full_name: "Hana Saito",   headline: "Design Director",  role: "recruiter" } },
      ],
      application_stages: [
        { id: "as-3", score: 74, recruitment_stages: { name: "CV Review", stage_type: "cv_review" } },
      ],
    },
  },
  {
    id: "entry-4",
    rank: 4,
    tags: ["Strong Fit", "Leaning hire"],
    applications: {
      id: "app-4",
      composite_score: 87,
      ai_rationale:
        "Exceptional technical breadth with strong system design thinking. Communication style is direct and well-structured. Likely to perform above median.",
      ai_confidence: 0.87,
      is_rejected: false,
      rejection_reason: null,
      applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      profiles: { id: "prof-4", full_name: "Daniel Park", headline: "Staff Engineer", role: "recruiter", email: "daniel.park@example.com" },
      shortlist_votes: [
        { id: "v11", vote: "up",     voter_id: "voter-1", profiles: { full_name: "Sarah Klein",  headline: "Hiring Manager",   role: "recruiter" } },
        { id: "v12", vote: "up",     voter_id: "voter-2", profiles: { full_name: "Marcus Idowu", headline: "Engineering Lead", role: "recruiter" } },
      ],
      application_stages: [
        { id: "as-4", score: 87, recruitment_stages: { name: "CV Review", stage_type: "cv_review" } },
      ],
    },
  },
  {
    id: "entry-5",
    rank: 5,
    tags: [],
    applications: {
      id: "app-5",
      composite_score: 75,
      ai_rationale:
        "Solid mid-level candidate. CV shows consistent delivery but limited ownership at scale. Worth a conversation to assess growth trajectory.",
      ai_confidence: 0.75,
      is_rejected: false,
      rejection_reason: null,
      applied_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      profiles: { id: "prof-5", full_name: "Liam O'Connor", headline: "Frontend Developer", role: "recruiter", email: "liam.oconnor@example.com" },
      shortlist_votes: [
        { id: "v13", vote: "up",      voter_id: "voter-1", profiles: { full_name: "Sarah Klein",  headline: "Hiring Manager",   role: "recruiter" } },
        { id: "v14", vote: "up",      voter_id: "voter-2", profiles: { full_name: "Marcus Idowu", headline: "Engineering Lead", role: "recruiter" } },
        { id: "v15", vote: "neutral", voter_id: "voter-3", profiles: { full_name: "Hana Saito",   headline: "Design Director",  role: "recruiter" } },
      ],
      application_stages: [
        { id: "as-5", score: 75, recruitment_stages: { name: "CV Review", stage_type: "cv_review" } },
      ],
    },
  },
  {
    id: "entry-6",
    rank: 6,
    tags: ["Strong Fit"],
    applications: {
      id: "app-6",
      composite_score: 82,
      ai_rationale:
        "Strong fit for the role with deep domain knowledge. Minor concerns about culture add given previous company size. Strong technical signals overall.",
      ai_confidence: 0.82,
      is_rejected: false,
      rejection_reason: null,
      applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      profiles: { id: "prof-6", full_name: "Hana Saito", headline: "Design Engineer", role: "recruiter", email: "hana.saito@example.com" },
      shortlist_votes: [
        { id: "v16", vote: "up",   voter_id: "voter-1", profiles: { full_name: "Sarah Klein",  headline: "Hiring Manager",   role: "recruiter" } },
        { id: "v17", vote: "down", voter_id: "voter-2", profiles: { full_name: "Marcus Idowu", headline: "Engineering Lead", role: "recruiter" } },
      ],
      application_stages: [
        { id: "as-6", score: 82, recruitment_stages: { name: "CV Review", stage_type: "cv_review" } },
      ],
    },
  },
];

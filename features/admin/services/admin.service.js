import { supabase } from "../../../shared/services/supabase";
import { sendPushNotification } from "../../../shared/services/notifications.service";

async function createInAppNotification({ userId, title, message, type }) {
  try {
    await supabase.from("notifications").insert({
      user_id: userId,
      title,
      message,
      type,
    });
  } catch (err) {
    console.warn("[Admin] createInAppNotification error:", err?.message);
  }
}

async function notifyAdmins(title, body, data = {}) {
  const { data: admins } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .eq("role", "admin")
    .not("expo_push_token", "is", null);
  if (admins) {
    const seen = new Set();
    for (const a of admins) {
      if (!seen.has(a.expo_push_token)) {
        seen.add(a.expo_push_token);
        sendPushNotification({ token: a.expo_push_token, title, body, data });
      }
    }
  }
}

export const getUserCountsByRole = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .neq("role", "admin");
  if (error) throw error;
  const counts = { recruiter: 0, applicant: 0 };
  (data || []).forEach((p) => {
    if (p.role === "recruiter" || p.role === "hr_manager") counts.recruiter++;
    if (p.role === "applicant") counts.applicant++;
  });
  return counts;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("role", "admin")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const usersWithViolations = await Promise.all(
    (data || []).map(async (user) => {
      const { count } = await supabase
        .from("user_actions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("action_type", ["ban", "freeze", "warn"]);
      return { ...user, violationCount: count || 0 };
    })
  );
  return usersWithViolations;
};

export const getFlaggedEntities = async () => {
  const { data: flaggedUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, severity_score")
    .gte("severity_score", 20);
  const { data: flaggedCompanies } = await supabase
    .from("companies")
    .select("id, name, severity_score")
    .gte("severity_score", 20);
  return { users: flaggedUsers || [], companies: flaggedCompanies || [] };
};

export const getViolationsByUser = async (userId) => {
  const { data, error } = await supabase
    .from("user_actions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const applyUserAction = async ({ userId, actionType, reason, durationDays, durationHours, adminId }) => {
  const updates = {};
  const action = {
    user_id: userId,
    action_type: actionType,
    reason: reason || null,
    applied_by: adminId,
  };

  if (actionType === "ban") {
    const now = new Date();
    const deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    updates.account_status = "banned";
    updates.suspension_reason = reason || null;
    updates.banned_at = now.toISOString();
    updates.appeal_deadline = deadline.toISOString();
    updates.appeal_status = "none";
  } else if (actionType === "freeze") {
    const days = durationDays || 0;
    const hours = durationHours || 0;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    expiresAt.setHours(expiresAt.getHours() + hours);
    updates.account_status = "frozen";
    updates.frozen_until = expiresAt.toISOString();
    updates.suspension_reason = reason || null;
    action.duration_days = days;
    action.duration_hours = hours;
    action.expires_at = expiresAt.toISOString();
  } else if (actionType === "active") {
    updates.account_status = "active";
    updates.frozen_until = null;
    updates.suspension_reason = null;
  } else if (actionType === "warn") {
  }

  if (actionType === "warn") {
    await createInAppNotification({
      userId,
      title: "Admin Warning",
      message: `You have received a warning from the admin team.${reason ? ` Reason: ${reason}` : ""}`,
      type: "admin_action",
    });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (updateError) throw updateError;

  const { error: actionError } = await supabase
    .from("user_actions")
    .insert([action]);
  if (actionError) throw actionError;

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("full_name, email, expo_push_token")
    .eq("id", userId)
    .single();

  const labels = { warn: "Warned", ban: "Banned", freeze: "Frozen", active: "Reactivated" };
  if (userProfile?.expo_push_token) {
    sendPushNotification({
      token: userProfile.expo_push_token,
      title: `Account ${labels[actionType]}`,
      body: `Your account has been ${labels[actionType].toLowerCase()}.${reason ? ` Reason: ${reason}` : ""}${actionType === "ban" ? " You have 7 days to submit an appeal." : ""}${actionType === "freeze" && durationDays ? ` Duration: ${durationDays} day(s).` : ""}`,
      data: { type: "admin_action", actionType },
    });
  }
};

export const createAdminUser = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: data.user.id,
      full_name: fullName,
      role: "admin",
      is_active: true,
      account_status: "active",
      email,
    },
  ]);
  if (profileError) throw profileError;
  return data.user;
};

export const getAllCompaniesWithStats = async () => {
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const withStats = await Promise.all(
    (companies || []).map(async (c) => {
      const { count: totalJobs } = await supabase
        .from("job_postings")
        .select("*", { count: "exact", head: true })
        .eq("company_id", c.id);
      const { count: activeJobs } = await supabase
        .from("job_postings")
        .select("*", { count: "exact", head: true })
        .eq("company_id", c.id)
        .is("closed_at", null);
      const { count: memberCount } = await supabase
        .from("company_memberships")
        .select("*", { count: "exact", head: true })
        .eq("company_id", c.id);
      return { ...c, totalJobs: totalJobs || 0, activeJobs: activeJobs || 0, memberCount: memberCount || 0 };
    })
  );
  return withStats;
};

export const getCompanyById = async (companyId) => {
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();
  if (error) throw error;

  const { data: jobs } = await supabase
    .from("job_postings")
    .select("*")
    .eq("company_id", companyId);
  const { data: members } = await supabase
    .from("company_memberships")
    .select("*, profile:profiles(id, full_name, email, role)")
    .eq("company_id", companyId);

  return { ...company, jobs: jobs || [], members: members || [] };
};

export const applyCompanyAction = async ({ companyId, actionType, reason, adminId }) => {
  const updates = {};
  const action = {
    company_id: companyId,
    action_type: actionType,
    reason: reason || null,
    applied_by: adminId,
  };

  if (actionType === "ban") {
    updates.account_status = "banned";
    updates.suspension_reason = reason || null;
    updates.banned_at = new Date().toISOString();
  } else if (actionType === "closing_warning") {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    updates.account_status = "closing_warning";
    updates.closing_deadline = deadline.toISOString();
    updates.suspension_reason = reason || null;
    action.duration_days = 7;
    action.expires_at = deadline.toISOString();
  } else if (actionType === "active") {
    updates.account_status = "active";
    updates.closing_deadline = null;
    updates.suspension_reason = null;
  } else if (actionType === "warn") {
  }

  if (actionType === "warn" || actionType === "closing_warning") {
    const { data: members } = await supabase
      .from("company_memberships")
      .select("profile_id")
      .eq("company_id", companyId);

    if (members) {
      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .single();

      const title = actionType === "closing_warning" ? "Closure Warning" : "Admin Warning";
      const msg = actionType === "closing_warning"
        ? `Your company (${company?.name}) has been scheduled for closure in 7 days. Contact support to resolve this.`
        : `Your company (${company?.name}) has received a warning from the admin team.${reason ? ` Reason: ${reason}` : ""}`;

      const uniqueMemberIds = [...new Set(members.map((m) => m.profile_id))];

      for (const userId of uniqueMemberIds) {
        await createInAppNotification({ userId, title, message: msg, type: "admin_action" });
      }

      const { data: memberProfiles } = await supabase
        .from("profiles")
        .select("expo_push_token")
        .in("id", uniqueMemberIds)
        .not("expo_push_token", "is", null);
      if (memberProfiles) {
        const seen = new Set();
        for (const mp of memberProfiles) {
          if (!seen.has(mp.expo_push_token)) {
            seen.add(mp.expo_push_token);
            sendPushNotification({ token: mp.expo_push_token, title, body: msg, data: { type: "admin_action", actionType } });
          }
        }
      }
    }
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId);
  if (updateError) throw updateError;

  const { error: actionError } = await supabase
    .from("company_actions")
    .insert([action]);
  if (actionError) throw actionError;

  if (["warn", "ban", "closing_warning", "active"].includes(actionType)) {
    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", companyId)
      .single();

    const { data: hrMembers } = await supabase
      .from("company_memberships")
      .select("profile_id")
      .eq("company_id", companyId)
      .eq("recruiter_permissions", "hr_manager");

    if (hrMembers?.length) {
      const hrIds = [...new Set(hrMembers.map((m) => m.profile_id))];
      const { data: hrProfiles } = await supabase
        .from("profiles")
        .select("full_name, email, expo_push_token")
        .in("id", hrIds);

      const labels = { warn: "Warned", ban: "Banned", closing_warning: "Closing Warning", active: "Reactivated" };
      if (hrProfiles) {
        const seen = new Set();
        for (const hr of hrProfiles) {
          if (hr.expo_push_token && actionType !== "warn" && actionType !== "closing_warning" && !seen.has(hr.expo_push_token)) {
            seen.add(hr.expo_push_token);
            sendPushNotification({
              token: hr.expo_push_token,
              title: `Company ${labels[actionType]}`,
              body: `Your company (${company?.name || "Unknown"}) has been ${labels[actionType].toLowerCase()}.${reason ? ` Reason: ${reason}` : ""}`,
              data: { type: "admin_action", actionType },
            });
          }
        }
      }
    }
  }
};

export const getCompanyActions = async (companyId) => {
  const { data, error } = await supabase
    .from("company_actions")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const closeCompanyJobs = async (companyId) => {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("job_postings")
    .update({ closed_at: now })
    .eq("company_id", companyId)
    .is("closed_at", null);
  if (error) throw error;
};

export const getPendingAppeals = async () => {
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, appeal_message, appeal_status, appeal_deadline, banned_at, suspension_reason")
    .eq("appeal_status", "pending_review")
    .order("banned_at", { ascending: false });

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, appeal_message, appeal_status, closing_deadline, banned_at, suspension_reason")
    .eq("appeal_status", "pending_review")
    .order("banned_at", { ascending: false });

  return { users: users || [], companies: companies || [] };
};

export const getAppealMessages = async ({ entityType, entityId }) => {
  const { data, error } = await supabase
    .from("appeal_messages")
    .select("*, sender:profiles!sender_id(id, full_name, role)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
};

export const sendAppealMessage = async ({ entityType, entityId, senderId, message }) => {
  const { error } = await supabase.from("appeal_messages").insert([
    { entity_type: entityType, entity_id: entityId, sender_id: senderId, message },
  ]);
  if (error) throw error;

  const isAdmin = senderId !== entityId;
  if (isAdmin) {
    if (entityType === "profile") {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("expo_push_token")
        .eq("id", entityId)
        .single();
      if (userProfile?.expo_push_token) {
        sendPushNotification({
          token: userProfile.expo_push_token,
          title: "New Reply to Your Appeal",
          body: `An admin replied: "${message.slice(0, 120)}"`,
          data: { type: "appeal", entityType, entityId },
        });
      }
    } else {
      const { data: hrMembers } = await supabase
        .from("company_memberships")
        .select("profile_id")
        .eq("company_id", entityId)
        .eq("recruiter_permissions", "hr_manager");
      if (hrMembers?.length) {
        const { data: hrProfiles } = await supabase
          .from("profiles")
          .select("expo_push_token")
          .in("id", hrMembers.map((m) => m.profile_id));
        if (hrProfiles) {
          const seen = new Set();
          for (const hr of hrProfiles) {
            if (hr.expo_push_token && !seen.has(hr.expo_push_token)) {
              seen.add(hr.expo_push_token);
              sendPushNotification({
                token: hr.expo_push_token,
                title: "New Reply to Your Company Appeal",
                body: `An admin replied: "${message.slice(0, 120)}"`,
                data: { type: "appeal", entityType, entityId },
              });
            }
          }
        }
      }
    }
  } else {
    await notifyAdmins(
      "New Appeal Message",
      `A user sent a new appeal message: "${message.slice(0, 120)}"`,
      { type: "appeal", entityType, entityId }
    );
  }
};

export const submitAppeal = async ({ entityType, entityId, senderId, message }) => {
  const table = entityType === "profile" ? "profiles" : "companies";
  const { error: appealError } = await supabase
    .from(table)
    .update({ appeal_message: message, appeal_status: "pending_review" })
    .eq("id", entityId);
  if (appealError) throw appealError;

  const { error: msgError } = await supabase.from("appeal_messages").insert([
    { entity_type: entityType, entity_id: entityId, sender_id: senderId, message },
  ]);
  if (msgError) throw msgError;

  await notifyAdmins("New Appeal Submitted", `A new appeal has been submitted.`, { type: "appeal", entityType, entityId });
};

export const resolveAppeal = async ({ entityType, entityId, adminId, approved, adminNote }) => {
  const table = entityType === "profile" ? "profiles" : "companies";
  const updates = { appeal_status: approved ? "approved" : "rejected" };
  if (adminNote) updates.appeal_notes = adminNote;

  if (approved) {
    if (entityType === "company") {
      updates.account_status = "active";
      updates.closing_deadline = null;
      updates.suspension_reason = null;
      updates.banned_at = null;
    } else {
      updates.account_status = "active";
      updates.suspension_reason = null;
      updates.banned_at = null;
      updates.frozen_until = null;
    }
  }

  const { error: updateError } = await supabase
    .from(table)
    .update(updates)
    .eq("id", entityId);
  if (updateError) throw updateError;

  if (!approved && entityType === "company") {
    await closeCompanyJobs(entityId);
  }

  if (adminNote) {
    const { error: msgError } = await supabase.from("appeal_messages").insert([
      { entity_type: entityType, entity_id: entityId, sender_id: adminId, message: adminNote },
    ]);
    if (msgError) throw msgError;
  }

  const pushTitle = approved ? "Appeal Approved" : "Appeal Rejected";
  const pushBody = approved ? "Your appeal has been approved. Your account has been reinstated." : "Your appeal has been reviewed and rejected. This decision is final.";

  if (entityType === "profile") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .eq("id", entityId)
      .single();
    if (profile?.expo_push_token) {
      sendPushNotification({ token: profile.expo_push_token, title: pushTitle, body: pushBody, data: { type: "appeal_resolved", entityType, entityId, approved } });
    }
  } else {
    const { data: hrMembers } = await supabase
      .from("company_memberships")
      .select("profile_id")
      .eq("company_id", entityId)
      .eq("recruiter_permissions", "hr_manager");
    if (hrMembers?.length) {
      const { data: hrProfiles } = await supabase
        .from("profiles")
        .select("expo_push_token")
        .in("id", hrMembers.map((m) => m.profile_id))
        .not("expo_push_token", "is", null);
      if (hrProfiles) {
        const seen = new Set();
        for (const hr of hrProfiles) {
          if (!seen.has(hr.expo_push_token)) {
            seen.add(hr.expo_push_token);
            sendPushNotification({ token: hr.expo_push_token, title: pushTitle, body: pushBody, data: { type: "appeal_resolved", entityType, entityId, approved } });
          }
        }
      }
    }
  }
};

export const getReports = async (filters = {}) => {
  let query = supabase
    .from("reports")
    .select("*, reporter:profiles!reporter_id(full_name, email)")
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.reportType) query = query.eq("report_type", filters.reportType);
  if (filters.severity) query = query.eq("severity", filters.severity);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const resolveReport = async ({ reportId, status, reviewedBy, resolutionNotes, actionTaken, scoredEntityType, scoredEntityId, severityOverride }) => {
  const now = new Date().toISOString();
  const severityScores = { low: 1, medium: 3, high: 5, critical: 10 };

  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single();
  if (fetchError) throw fetchError;

  const effectiveSeverity = severityOverride || report.severity;

  const updates = {
    status,
    severity: effectiveSeverity,
    reviewed_by: reviewedBy,
    reviewed_at: now,
    resolution_notes: resolutionNotes || null,
    action_taken: actionTaken || null,
    scored_entity_type: scoredEntityType || null,
    scored_entity_id: scoredEntityId || null,
  };

  const { error: reportError } = await supabase.from("reports").update(updates).eq("id", reportId);
  if (reportError) throw reportError;

  if (scoredEntityType && scoredEntityId) {
    const points = severityScores[effectiveSeverity] || 0;
    const table = scoredEntityType === "user" ? "profiles" : "companies";
    const { data: entity } = await supabase
      .from(table)
      .select("severity_score")
      .eq("id", scoredEntityId)
      .single();
    const newScore = (entity?.severity_score || 0) + points;
    await supabase.from(table).update({ severity_score: newScore }).eq("id", scoredEntityId);
  }

  if (!scoredEntityType && !scoredEntityId && status === "resolved") {
    await supabase.from("technical_issues").insert([
      {
        reporter_id: report.reporter_id,
        issue_type: "other",
        title: `Platform issue: ${report.subject}`,
        description: report.description,
        severity: effectiveSeverity,
        related_report_id: reportId,
      },
    ]);
  }
};

export const getTechnicalIssues = async (filters = {}) => {
  let query = supabase
    .from("technical_issues")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.issueType) query = query.eq("issue_type", filters.issueType);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const updateTechnicalIssueStatus = async ({ id, status, resolutionNotes, assignedTo }) => {
  const updates = { status, resolution_notes: resolutionNotes || null, assigned_to: assignedTo || null };
  if (status === "resolved") updates.resolved_at = new Date().toISOString();
  const { error } = await supabase.from("technical_issues").update(updates).eq("id", id);
  if (error) throw error;
};

export const processExpiredDeadlines = async () => {
  const now = new Date().toISOString();

  const { data: expiredUsers } = await supabase
    .from("profiles")
    .select("id")
    .eq("appeal_status", "pending_review")
    .lt("appeal_deadline", now);

  if (expiredUsers?.length) {
    const expiredIds = expiredUsers.map((u) => u.id);
    await supabase
      .from("profiles")
      .update({ appeal_status: "rejected", account_status: "banned" })
      .in("id", expiredIds);
  }

  const { data: expiredCompanies } = await supabase
    .from("companies")
    .select("id")
    .eq("account_status", "closing_warning")
    .lt("closing_deadline", now);

  if (expiredCompanies?.length) {
    const expiredIds = expiredCompanies.map((c) => c.id);
    await supabase
      .from("companies")
      .update({ account_status: "banned", banned_at: now })
      .in("id", expiredIds);
    for (const cId of expiredIds) {
      await closeCompanyJobs(cId);
    }
  }
};

export const fetchCompanyByProfileId = async (profileId) => {
  const { data: membership } = await supabase
    .from("company_memberships")
    .select("*, company:companies(*)")
    .eq("profile_id", profileId)
    .maybeSingle();
  return { company: membership?.company || null, permission: membership?.recruiter_permissions || null };
};

export const getQuestionWithAnswer = async (questionId) => {
  const { data, error } = await supabase
    .from("application_questions")
    .select(`
      *,
      application_answers (
        id, answer_text, score, feedback, recording_url, transcript, strengths, weaknesses, created_at
      )
    `)
    .eq("id", questionId)
    .single();
  if (error) throw error;
  return data;
};

export const getStageWithEvaluation = async (stageId) => {
  const { data, error } = await supabase
    .from("application_stages")
    .select(`
      *,
      recruitment_stages ( id, name, stage_type, order_index ),
      application_stage_evaluations ( ai_score, confidence, recommendation, reasoning, strengths, weaknesses )
    `)
    .eq("id", stageId)
    .single();
  if (error) throw error;
  return data;
};

export const submitReport = async ({ reporterId, reportType, targetId, targetDetails, subject, description, severity }) => {
  const { data, error } = await supabase.from("reports").insert([
    {
      reporter_id: reporterId,
      report_type: reportType,
      target_id: targetId,
      target_details: targetDetails || null,
      subject,
      description,
      severity: severity || "medium",
    },
  ]);
  if (error) throw error;

  const { data: reporter } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", reporterId)
    .single();

  const severityScores = { low: 1, medium: 3, high: 5, critical: 10 };
  await supabase.functions.invoke("send-contact-email", {
    body: {
      name: reporter?.full_name || "Unknown",
      email: reporter?.email || "unknown@example.com",
      company: `Report: ${reportType} (${severity || "medium"}, +${severityScores[severity || "medium"]}pts)`,
      message: `[Report Type: ${reportType}]\n[Target ID: ${targetId}]\n[Subject: ${subject}]\n\n${description}`,
    },
  });

  return data;
};

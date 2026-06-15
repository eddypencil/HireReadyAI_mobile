import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  getCandidateProfile,
  getJobScorePercentile,
  getPercentileTag,
} from "../services/candidateProfile.service";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useUser } from "../../auth/context/user.context";
import { supabase } from "../../../shared/services/supabase";
import {
  rejectApplication,
  unrejectApplication,
} from "../../shortlist/services/shortlist.service";

function getInitials(name = "") {
  return (
    (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function parseAIFeedback(stage) {
  if (!stage?.ai_feedback) return null;
  try {
    return typeof stage.ai_feedback === "string"
      ? JSON.parse(stage.ai_feedback)
      : stage.ai_feedback;
  } catch {
    return null;
  }
}

function DimensionBar({ label, score, c, isRtl }) {
  const barColor =
    score >= 80
      ? c.success
      : score >= 60
        ? c.primary
        : score >= 40
          ? c.warning
          : c.destructive;
  return (
    <View style={[dimStyles.row, isRtl && dimStyles.rowReverse]}>
      <Text
        style={[
          dimStyles.label,
          { color: c["muted-foreground"] },
          isRtl && dimStyles.textRight,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View style={[dimStyles.track, { backgroundColor: c.border }]}>
        <View
          style={[
            dimStyles.fill,
            { width: `${Math.min(score, 100)}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      <Text
        style={[
          dimStyles.score,
          { color: c.foreground },
          isRtl && { textAlign: "left" },
        ]}
      >
        {Math.round(score)}
      </Text>
    </View>
  );
}

const dimStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  rowReverse: { flexDirection: "row-reverse" },
  label: { fontSize: 12, fontWeight: '600', width: 100 },
  textRight: { textAlign: "right" },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  score: { fontSize: 13, fontWeight: '700', width: 28, textAlign: "right" },
});

function BulletList({ items, color, icon, isRtl }) {
  if (!items || items.length === 0) return null;
  return (
    <View
      style={[
        bulStyles.container,
        { backgroundColor: color + "10", borderColor: color + "30" },
      ]}
    >
      {items.map((item, i) => (
        <View key={i} style={[bulStyles.item, isRtl && bulStyles.rowReverse]}>
          <Ionicons
            name={icon}
            size={14}
            color={color}
            style={[bulStyles.icon, isRtl && { marginLeft: 6, marginRight: 0 }]}
          />
          <Text
            style={[bulStyles.text, { color }, isRtl && { textAlign: "right" }]}
          >
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

const bulStyles = StyleSheet.create({
  container: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  item: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  rowReverse: { flexDirection: "row-reverse" },
  icon: { marginRight: 6, marginTop: 1 },
  text: { fontSize: 13, flex: 1, lineHeight: 18 },
});

function StageScoreCard({
  stages,
  onViewAssessments,
  c,
  interviewCount,
  isRtl,
}) {
  const { t } = useTranslation();
  if (!stages || stages.length === 0) return null;
  const sorted = [...stages].sort(
    (a, b) =>
      (a.recruitment_stages?.order_index || 0) -
      (b.recruitment_stages?.order_index || 0),
  );
  return (
    <View
      style={[
        sectionStyles.card,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <View style={sectionStyles.cardHeader}>
        <Ionicons name="trophy-outline" size={16} color={c.primary} />
        <Text style={[sectionStyles.cardTitle, { color: c.foreground }]}>
          {t("recruiter.stage_scores")}
        </Text>
      </View>
      {sorted.map((stage) => {
        const statusColor =
          stage.status === "passed"
            ? c.success
            : stage.status === "failed"
              ? c.destructive
              : stage.status === "in_progress"
                ? c.primary
                : c["muted-foreground"];
        const stageName =
          stage.recruitment_stages?.name ||
          stage.recruitment_stages?.stage_type ||
          t("recruiter.unknown");
        return (
          <View
            key={stage.id}
            style={[sectionStyles.stageRow, isRtl && sectionStyles.rowReverse]}
          >
            <View
              style={[sectionStyles.dot, { backgroundColor: statusColor }]}
            />
            <Text
              style={[
                sectionStyles.stageName,
                { color: c.foreground },
                isRtl && sectionStyles.textRight,
              ]}
              numberOfLines={1}
            >
              {stageName}
            </Text>
            {stage.score != null && (
              <View
                style={[
                  sectionStyles.scorePill,
                  {
                    backgroundColor:
                      stage.score >= 80
                        ? `${c.success}20`
                        : stage.score >= 60
                          ? `${c.primary}20`
                          : `${c.destructive}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    sectionStyles.scorePillText,
                    {
                      color:
                        stage.score >= 80
                          ? c.success
                          : stage.score >= 60
                            ? c.primary
                            : c.destructive,
                    },
                  ]}
                >
                  {Math.round(stage.score)}
                </Text>
              </View>
            )}
            <Text
              style={[
                sectionStyles.statusText,
                { color: statusColor },
                isRtl && { textAlign: "left" },
              ]}
            >
              {stage.status === "in_progress"
                ? t("recruiter.in_progress")
                : stage.status
                  ? stage.status.charAt(0).toUpperCase() + stage.status.slice(1)
                  : t("recruiter.pending")}
            </Text>
          </View>
        );
      })}
      {interviewCount > 0 && (
        <TouchableOpacity
          style={[
            sectionStyles.assessLink,
            isRtl && sectionStyles.rowReverse,
            { borderTopColor: c.border },
          ]}
          onPress={onViewAssessments}
        >
          <Ionicons name="document-text-outline" size={16} color={c.accent} />
          <Text style={[sectionStyles.assessLinkText, { color: c.accent }]}>
            {t("recruiter.assessments_results", { count: interviewCount })}
          </Text>
          <Ionicons
            name={isRtl ? "chevron-back" : "chevron-forward"}
            size={16}
            color={c.accent}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  rowReverse: { flexDirection: "row-reverse" },
  textRight: { textAlign: "right" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stageName: { fontSize: 13, fontWeight: '500', flex: 1 },
  scorePill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  scorePillText: { fontSize: 12, fontWeight: '700' },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 70,
    textAlign: "right",
  },
  assessLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  assessLinkText: { flex: 1, fontSize: 13, fontWeight: '600' },
});

function createStyles(c) {
  return StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: "center", alignItems: "center" },
    errorText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
    backLink: { fontSize: 14, fontWeight: '600', marginTop: 12 },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    backBtnText: { fontSize: 14, fontWeight: '600' },
    headerCard: {
      borderRadius: 14,
      borderWidth: 1,
      marginHorizontal: 16,
      padding: 16,
      marginBottom: 16,
    },
    headerRow: { flexDirection: "row", gap: 14 },
    avatarLarge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarLargeText: { fontSize: 20, fontWeight: '700' },
    headerInfo: { flex: 1 },
    headerNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
    },
    headerName: { fontSize: 18, fontWeight: '700' },
    rejectedBadge: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderWidth: 1,
    },
    rejectedBadgeText: { fontSize: 11, fontWeight: '700' },
    headerHeadline: { fontSize: 13, marginTop: 2 },
    headerMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 6,
    },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { fontSize: 12 },
    compositeWrap: { alignItems: "center", gap: 4 },
    compositeCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    compositeScore: { fontSize: 22, fontWeight: '800' },
    compositeLabel: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    percentileBadge: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderWidth: 1,
    },
    percentileText: { fontSize: 10, fontWeight: '700' },
    cvBanner: {
      borderRadius: 14,
      borderWidth: 1,
      marginHorizontal: 16,
      padding: 16,
      marginBottom: 16,
    },
    cvBannerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    cvBannerTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    cvBannerTitle: { fontSize: 16, fontWeight: '700' },
    recoBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    recoBadgeText: { fontSize: 11, fontWeight: '800' },
    cvFeedbackText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
    dimSection: { marginBottom: 12 },
    dimHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 10,
    },
    dimHeaderText: { fontSize: 13, fontWeight: '700' },
    noCvCard: {
      borderRadius: 14,
      borderWidth: 1,
      marginHorizontal: 16,
      padding: 32,
      alignItems: "center",
      marginBottom: 16,
    },
    noCvText: { fontSize: 15, fontWeight: '600', marginTop: 8 },
    noCvSubtext: { fontSize: 12, marginTop: 4 },

    actionDivider: { borderTopWidth: 1, marginVertical: 14 },

    rejectBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderWidth: 1.5,
      borderRadius: 10,
      paddingVertical: 10,
    },
    rejectBtnText: { fontSize: 14, fontWeight: '700' },

    unrejectBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 10,
      paddingVertical: 10,
    },
    unrejectBtnText: { fontSize: 14, fontWeight: '700', color: "#fff" },

    actionError: { fontSize: 12, marginTop: 6, textAlign: "center" },

    viewProfileBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 10,
      paddingVertical: 10,
      marginTop: 12,
    },
    viewProfileBtnText: { fontSize: 14, fontWeight: '700', color: "#fff" },

    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
  });
}

export default function CandidateProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation();
  const route = useRoute();
  const { applicationId } = route.params || {};
  const { t, language } = useTranslation();
  const isRtl = language === "ar";
  const { profile: recruiterProfile, user } = useUser();

  const [profile, setProfile] = useState(null);
  const [percentile, setPercentile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const styles = createStyles(c);

  useEffect(() => {
    if (!applicationId) return;
    loadProfile();
  }, [applicationId]);

  async function loadProfile() {
    setLoading(true);
    try {
      const { data, error: err } = await getCandidateProfile(applicationId);
      if (err) {
        setError(err.message);
        return;
      }
      setProfile(data);
      if (
        data?.job_postings?.id &&
        data.composite_score != null &&
        data.composite_score !== 0
      ) {
        const { percentile: p } = await getJobScorePercentile(
          data.job_postings.id,
          data.composite_score,
        );
        setPercentile(p);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: c.background },
        ]}
      >
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: c.background },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={48} color={c.destructive} />
        <Text style={[styles.errorText, { color: c.destructive }]}>
          {error || t("recruiter.candidate_not_found")}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backLink, { color: c.accent }]}>
            {t("recruiter.back_to_pipeline")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const app = profile;
  const candidate = app.profiles || {};
  const stages = (app.application_stages || []).sort(
    (a, b) =>
      (a.recruitment_stages?.order_index || 0) -
      (b.recruitment_stages?.order_index || 0),
  );
  const cvStage = stages.find(
    (s) => s.recruitment_stages?.stage_type === "cv_review",
  );
  const cvFeedback = parseAIFeedback(cvStage);

  const stagesWithEvals = stages.filter((s) => {
    const raw = s.application_stage_evaluations;
    const d = Array.isArray(raw) ? raw[0] : raw;
    return d?.reasoning || d?.recommendation;
  });
  const lastEvalStage = stagesWithEvals[stagesWithEvals.length - 1] || stages[0];
  const evalsRaw = lastEvalStage?.application_stage_evaluations;
  const currentEval = Array.isArray(evalsRaw) ? evalsRaw[0] : evalsRaw;

  const scoredStages = stages.filter((s) => s.score != null);
  const computedComposite =
    scoredStages.length > 0
      ? Math.round(
          scoredStages.reduce((sum, s) => sum + Number(s.score), 0) /
            scoredStages.length,
        )
      : (app.composite_score ?? null);

  const percentileTag = getPercentileTag(percentile);

  const interviewStages = stages.filter((s) =>
    [
      "assessment_test",
      "coding_test",
      "video_interview",
      "technical_interview",
      "hr_interview",
      "manager_interview",
      "ai_screening",
    ].includes(s.recruitment_stages?.stage_type),
  );

  const handleReject = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const candidateEmail = app.answers?.info?.email;
      const fromEmail = user?.email;
      if (candidateEmail && fromEmail) {
        const { error: fnError } = await supabase.functions.invoke(
          "send-offer-email",
          {
            body: {
              to: candidateEmail,
              fromName: recruiterProfile?.full_name || "Hiring Team",
              fromEmail,
              subject: `Update on Your Application - ${app.job_postings?.title || "Our Company"}`,
              body:
                `Dear ${candidate.full_name || "Candidate"},\n\n` +
                `Thank you for your interest in joining ${app.job_postings?.title || "our company"} and for taking the time to go through our hiring process.\n\n` +
                `After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match the requirements of the role.\n` +
                (currentEval?.reasoning ? `\nFeedback: ${currentEval.reasoning}\n` : "") +
                `\nWe appreciate your effort and wish you the very best in your future endeavors.\n\n` +
                `Sincerely,\n${recruiterProfile?.full_name || "The Hiring Team"}`,
              applicationId,
              jobId: app.job_id,
              action: "reject",
            },
          },
        );
        if (fnError) console.warn("[Rejection email] edge function error:", fnError);
      }

      await rejectApplication(applicationId, currentEval?.reasoning || "");
      setProfile((prev) => ({ ...prev, is_rejected: true }));
    } catch (err) {
      setActionError(err.message || "Failed to reject candidate");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnreject = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      await unrejectApplication(applicationId);
      setProfile((prev) => ({ ...prev, is_rejected: false }));
    } catch (err) {
      setActionError(err.message || "Failed to un-reject candidate");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Back button */}
      <TouchableOpacity
        style={[
          styles.backBtn,
          isRtl && styles.rowReverse,
          { paddingTop: insets.top + 8 },
        ]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name={isRtl ? "arrow-forward" : "arrow-back"}
          size={22}
          color={c.primary}
        />
        <Text style={[styles.backBtnText, { color: c.primary }]}>
          {t("recruiter.back_to_pipeline")}
        </Text>
      </TouchableOpacity>

      {/* Candidate Header */}
      <View
        style={[
          styles.headerCard,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <View style={[styles.headerRow, isRtl && styles.rowReverse]}>
          <View
            style={[
              styles.avatarLarge,
              {
                backgroundColor: `${c.primary}20`,
                borderColor: `${c.primary}40`,
              },
            ]}
          >
            <Text style={[styles.avatarLargeText, { color: c.primary }]}>
              {getInitials(candidate.full_name)}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={[styles.headerNameRow, isRtl && styles.rowReverse]}>
              <Text
                style={[
                  styles.headerName,
                  { color: c.foreground },
                  isRtl && styles.textRight,
                ]}
              >
                {candidate.full_name || t("recruiter.unknown_candidate")}
              </Text>
              {app.is_rejected && (
                <View
                  style={[
                    styles.rejectedBadge,
                    {
                      backgroundColor: `${c.destructive}18`,
                      borderColor: `${c.destructive}30`,
                    },
                  ]}
                >
                  <Text
                    style={[styles.rejectedBadgeText, { color: c.destructive }]}
                  >
                    {t("recruiter.rejected_badge")}
                  </Text>
                </View>
              )}
            </View>
            {candidate.headline && (
              <Text
                style={[
                  styles.headerHeadline,
                  { color: c["muted-foreground"] },
                  isRtl && styles.textRight,
                ]}
              >
                {candidate.headline}
              </Text>
            )}
            <View style={[styles.headerMeta, isRtl && styles.rowReverse]}>
              {app.job_postings?.title && (
                <View style={[styles.metaItem, isRtl && styles.rowReverse]}>
                  <Ionicons
                    name="briefcase-outline"
                    size={13}
                    color={c["muted-foreground"]}
                    style={
                      isRtl
                        ? { marginLeft: 4, marginRight: 0 }
                        : { marginRight: 4 }
                    }
                  />
                  <Text
                    style={[
                      styles.metaText,
                      { color: c["muted-foreground"] },
                      isRtl && styles.textRight,
                    ]}
                  >
                    {app.job_postings.title}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Composite Score */}
          <View style={styles.compositeWrap}>
            <View
              style={[
                styles.compositeCircle,
                {
                  backgroundColor: `${c.primary}15`,
                  borderColor: `${c.primary}30`,
                },
              ]}
            >
              <Text style={[styles.compositeScore, { color: c.primary }]}>
                {computedComposite ?? "--"}
              </Text>
            </View>
            <Text
              style={[styles.compositeLabel, { color: c["muted-foreground"] }]}
            >
              {t("recruiter.composite_label")}
            </Text>
            {percentileTag && (
              <View
                style={[
                  styles.percentileBadge,
                  {
                    backgroundColor: `${c.warning}18`,
                    borderColor: `${c.warning}30`,
                  },
                ]}
              >
                <Text style={[styles.percentileText, { color: c.warning }]}>
                  {percentileTag.label}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.viewProfileBtn,
            { backgroundColor: c.primary, borderColor: c.primary },
          ]}
          onPress={() =>
            navigation.navigate("ApplicantProfile", {
              profileId: candidate.id,
              viewOnly: true,
            })
          }
        >
          <Ionicons name="person-outline" size={16} color="#fff" />
          <Text style={styles.viewProfileBtnText}>
            {t("recruiter.view_profile")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI CV Review */}
      {cvFeedback ? (
        <View
          style={[
            styles.cvBanner,
            { backgroundColor: `${c.accent}10`, borderColor: `${c.accent}30` },
          ]}
        >
          <View style={[styles.cvBannerHeader, isRtl && styles.rowReverse]}>
            <View style={[styles.cvBannerTitleRow, isRtl && styles.rowReverse]}>
              <Ionicons
                name="sparkles"
                size={20}
                color={c.accent}
                style={isRtl ? { marginLeft: 6 } : { marginRight: 6 }}
              />
              <Text
                style={[
                  styles.cvBannerTitle,
                  { color: c.foreground },
                  isRtl && styles.textRight,
                ]}
              >
                {t("recruiter.ai_cv_review")}
              </Text>
            </View>
            <View
              style={[
                styles.recoBadge,
                {
                  backgroundColor:
                    cvFeedback.recommendation === "proceed"
                      ? `${c.success}20`
                      : cvFeedback.recommendation === "review"
                        ? `${c.warning}20`
                        : `${c.destructive}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.recoBadgeText,
                  {
                    color:
                      cvFeedback.recommendation === "proceed"
                        ? c.success
                        : cvFeedback.recommendation === "review"
                          ? c.warning
                          : c.destructive,
                  },
                  isRtl && styles.textRight,
                ]}
              >
                {cvFeedback.recommendation?.toUpperCase() || t("recruiter.na")}
              </Text>
            </View>
          </View>
          <Text
            style={[styles.cvFeedbackText, { color: c["muted-foreground"] }]}
          >
            {cvFeedback.feedback}
          </Text>

          {/* Reject / Unreject */}
          <View style={[styles.actionDivider, { borderTopColor: `${c.accent}30` }]} />
          {app.is_rejected ? (
            <TouchableOpacity
              style={[styles.unrejectBtn, { backgroundColor: c.success }]}
              onPress={handleUnreject}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
              )}
              <Text style={styles.unrejectBtnText}>
                {actionLoading ? "Unrejecting..." : "Unreject"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.rejectBtn, { borderColor: c.destructive }]}
              onPress={handleReject}
              disabled={actionLoading}
              activeOpacity={0.7}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={c.destructive} />
              ) : (
                <Ionicons name="close-circle" size={16} color={c.destructive} />
              )}
              <Text style={[styles.rejectBtnText, { color: c.destructive }]}>
                {actionLoading ? "Rejecting..." : "Reject"}
              </Text>
            </TouchableOpacity>
          )}
          {actionError ? (
            <Text style={[styles.actionError, { color: c.destructive }]}>
              {actionError}
            </Text>
          ) : null}
          <View style={[styles.actionDivider, { borderTopColor: `${c.accent}30` }]} />

          {/* Dimension Scores */}
          {cvFeedback.dimension_scores && (
            <View style={styles.dimSection}>
              <View style={styles.dimHeader}>
                <Ionicons
                  name="bar-chart-outline"
                  size={15}
                  color={c.primary}
                />
                <Text style={[styles.dimHeaderText, { color: c.foreground }]}>
                  {t("recruiter.dimension_scores")}
                </Text>
              </View>
              {Object.entries(cvFeedback.dimension_scores).map(([key, val]) => (
                <DimensionBar
                  key={key}
                  label={key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  score={val}
                  c={c}
                  isRtl={isRtl}
                />
              ))}
            </View>
          )}

          {/* Strengths / Weaknesses / Gaps */}
          {cvFeedback.strengths?.length > 0 && (
            <BulletList
              items={cvFeedback.strengths}
              color={c.success}
              icon="checkmark-circle"
              isRtl={isRtl}
            />
          )}
          {cvFeedback.weaknesses?.length > 0 && (
            <BulletList
              items={cvFeedback.weaknesses}
              color={c.destructive}
              icon="close-circle"
              isRtl={isRtl}
            />
          )}
          {cvFeedback.gaps?.length > 0 && (
            <BulletList
              items={cvFeedback.gaps}
              color={c.warning}
              icon="alert-circle"
              isRtl={isRtl}
            />
          )}
        </View>
      ) : (
        <View
          style={[
            styles.noCvCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <Ionicons name="document-text-outline" size={36} color={c.border} />
          <Text style={[styles.noCvText, { color: c["muted-foreground"] }]}>
            {t("recruiter.no_cv_review")}
          </Text>
          <Text style={[styles.noCvSubtext, { color: c["muted-foreground"] }]}>
            {t("recruiter.cv_not_reviewed")}
          </Text>
        </View>
      )}

      {/* Stage Scores */}
      <StageScoreCard
        stages={stages}
        interviewCount={interviewStages.length}
        c={c}
        onViewAssessments={() =>
          navigation.navigate("CandidateAssessments", { applicationId })
        }
        isRtl={isRtl}
      />
    </ScrollView>
  );
}

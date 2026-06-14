// features/applicant/pages/ApplicantFeedbackPage.js
// ============================================================================
// Tabbed feedback page: Overview | CV Review | Assessments
// Redesigned with ocean gradient (no black)
// ============================================================================

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUser } from "../../auth/context/user.context";
import { supabase } from "../../../shared/services/supabase";
import {
  getCandidateProfile,
  getCandidateStageQuestions,
  getJobScorePercentile,
  getPercentileTag,
} from "../../recruiter/services/candidateProfile.service";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";


// -- Sub-components
import AppSelector from "../components/feedback/AppSelector";
import ApplicationTimeline from "../components/feedback/ApplicationTimeline";
import KeyTakeaways from "../components/feedback/KeyTakeaways";
import SkillsToDevelop from "../components/feedback/SkillsToDevelop";
import SimilarOpportunities from "../components/feedback/SimilarOpportunities";
import CvReviewSection from "../components/feedback/CvReviewSection";
import AssessmentsSection from "../components/feedback/AssessmentsSection";
import CandidateHeader from "../components/feedback/CandidateHeader";

function parseAIFeedback(stage) {
  if (!stage?.ai_feedback) return null;
  try {
    return JSON.parse(stage.ai_feedback);
  } catch {
    return null;
  }
}

const INTERVIEW_STAGE_TYPES = [
  "assessment_test",
  "coding_test",
  "video_interview",
  "technical_interview",
  "hr_interview",
  "manager_interview",
  "ai_screening",
  "assessment",
];

// -- Segmented Tab bar (gradient active state, no black)
function TabBar({ active, onSelect }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const { tb } = createStyles(c);
  const TABS = [
    t("applicant.feedback.tab_overview"),
    t("applicant.feedback.tab_cv_review"),
    t("applicant.feedback.tab_assessments"),
  ];
  return (
    <View style={tb.outer}>
      <View style={tb.bar}>
        {TABS.map((tab, i) => {
          const isActive = active === i;
          if (isActive) {
            return (
              <TouchableOpacity
                key={tab}
                style={[tb.tabWrapper, tb.tab, tb.tabActive]}
                onPress={() => onSelect(i)}
                activeOpacity={0.85}
              >
                <Text style={tb.labelActive}>{tab}</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={tab}
              style={[tb.tabWrapper, tb.tab]}
              onPress={() => onSelect(i)}
              activeOpacity={0.7}
            >
              <Text style={tb.label}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ----------------------------------------------------------
// MAIN PAGE
// ----------------------------------------------------------
export default function ApplicantFeedbackPage() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { styles } = createStyles(c);
  const { t } = useTranslation();
  const { user } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  const initialAppId = route.params?.appId || null;

  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [stagesWithQuestions, setStagesWithQuestions] = useState([]);
  const [activeStage, setActiveStage] = useState(null);
  const [percentile, setPercentile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // -- Fetch applications list
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    supabase
      .from("applications")
      .select(
        `id, current_stage, is_rejected, applied_at,
        job_postings ( id, title, seniority_level, job_type, companies ( id, name, location ) )`,
      )
      .eq("candidate_profile_id", user.id)
      .order("applied_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const filtered = data.filter(
            (a) =>
              a.current_stage === "rejected" ||
              a.is_rejected === true ||
              a.current_stage === "hired",
          );
          setApplications(filtered);
          if (initialAppId && filtered.some((a) => a.id === initialAppId))
            setSelectedId(initialAppId);
          else if (filtered.length > 0) setSelectedId(filtered[0].id);
        }
        setLoading(false);
      });
  }, [user?.id]);

  // -- Fetch selected application detail
  useEffect(() => {
    if (!selectedId) {
      setSelectedApp(null);
      setStagesWithQuestions([]);
      setActiveStage(null);
      return;
    }
    setSelectedApp(null);
    getCandidateProfile(selectedId).then(async ({ data }) => {
      setSelectedApp(data);
      if (
        data?.job_postings?.id &&
        data.composite_score != null &&
        data.composite_score !== 0
      ) {
        getJobScorePercentile(data.job_postings.id, data.composite_score).then(
          ({ percentile: p }) => setPercentile(p),
        );
      }
      const allStages = (data?.application_stages || [])
        .filter((s) => s.recruitment_stages)
        .sort(
          (a, b) =>
            (a.recruitment_stages.order_index || 0) -
            (b.recruitment_stages.order_index || 0),
        );
      const interviewStages = allStages.filter((s) =>
        INTERVIEW_STAGE_TYPES.includes(s.recruitment_stages?.stage_type),
      );
      if (interviewStages.length === 0) {
        setStagesWithQuestions([]);
        setActiveStage(null);
        return;
      }
      const stageQuestions = await Promise.all(
        interviewStages.map(async (stage) => {
          const { data: questions } = await getCandidateStageQuestions(
            stage.id,
          );
          return { ...stage, questions: questions || [] };
        }),
      );
      setStagesWithQuestions(stageQuestions);
      setActiveStage(stageQuestions[0]);
    });
  }, [selectedId]);

  // -- Reset to Overview when app changes
  useEffect(() => {
    setActiveTab(0);
  }, [selectedId]);

  const app = selectedApp;
  const percentileTag = getPercentileTag(percentile);
  const allStages = (app?.application_stages || [])
    .filter((s) => s.recruitment_stages)
    .sort(
      (a, b) =>
        (a.recruitment_stages.order_index || 0) -
        (b.recruitment_stages.order_index || 0),
    );
  const cvStage = allStages.find(
    (s) => s.recruitment_stages?.stage_type === "cv_review",
  );
  const cvFeedback = parseAIFeedback(cvStage);

  // -- Loading
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={styles.loadingText}>
          {t("applicant.feedback.loading")}
        </Text>
      </View>
    );
  }

  // -- Empty state
  if (applications.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="document-text-outline"
              size={32}
              color={c["muted-foreground"]}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {t("applicant.feedback.no_feedback_title")}
          </Text>
          <Text style={styles.emptySubtitle}>
            {t("applicant.feedback.no_feedback_subtitle")}
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate("JobsTab")}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>
              {t("applicant.feedback.explore_jobs")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* App selector */}
      <View style={styles.selectorBar}>
        <AppSelector
          applications={applications}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </View>

      {/* No app selected */}
      {!app && (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={c.primary} />
          <Text style={styles.loadingText}>
            {t("applicant.feedback.loading_short")}
          </Text>
        </View>
      )}

      {app && (
        <>
          {/* Tab bar */}
          <TabBar active={activeTab} onSelect={setActiveTab} />

          {/* -- TAB 0: Overview */}
          {activeTab === 0 && (
            <ScrollView
              style={styles.tabScroll}
              contentContainerStyle={styles.tabContent}
            >
              <CandidateHeader
                app={app}
                percentile={percentile}
                percentileTag={percentileTag}
              />
              <KeyTakeaways
                cvFeedback={cvFeedback}
                stages={stagesWithQuestions}
              />
              {allStages.length > 0 && (
                <ApplicationTimeline stages={allStages} />
              )}
              <SkillsToDevelop
                cvFeedback={cvFeedback}
                stages={stagesWithQuestions}
              />
              <SimilarOpportunities
                jobId={app.job_postings?.id}
                seniorityLevel={app.job_postings?.seniority_level}
                jobType={app.job_postings?.job_type}
              />
              <View style={{ height: 32 }} />
            </ScrollView>
          )}

          {/* -- TAB 1: CV Review */}
          {activeTab === 1 && (
            <ScrollView
              style={styles.tabScroll}
              contentContainerStyle={styles.tabContent}
            >
              {!cvFeedback ? (
                <View style={styles.emptyTab}>
                  <Ionicons
                    name="document-text-outline"
                    size={44}
                    color={c["muted-foreground"]}
                  />

                  <Text style={styles.emptyTabTitle}>
                    {t("applicant.feedback.no_cv_review")}
                  </Text>
                  <Text style={styles.emptyTabSubtitle}>
                    {t("applicant.feedback.no_cv_review_sub")}
                  </Text>
                </View>
              ) : (
                <CvReviewSection app={app} />
              )}
              <View style={{ height: 32 }} />
            </ScrollView>
          )}

          {/* -- TAB 2: Assessments */}
          {activeTab === 2 && (
            <ScrollView
              style={styles.tabScroll}
              contentContainerStyle={styles.tabContent}
            >
              {stagesWithQuestions.length === 0 ? (
                <View style={styles.emptyTab}>
                  <Ionicons
                    name="bulb-outline"
                    size={44}
                    color={c["muted-foreground"]}
                  />

                  <Text style={styles.emptyTabTitle}>
                    {t("applicant.feedback.no_assessments")}
                  </Text>
                  <Text style={styles.emptyTabSubtitle}>
                    {t("applicant.feedback.no_assessments_sub")}
                  </Text>
                </View>
              ) : (
                <AssessmentsSection
                  stagesWithQuestions={stagesWithQuestions}
                  activeStage={activeStage}
                  onSelectStage={setActiveStage}
                  candidateName={app.profiles?.full_name}
                  jobTitle={app.job_postings?.title}
                />
              )}
              <View style={{ height: 32 }} />
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

function createStyles(c) {
  const tb = StyleSheet.create({
    outer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
    bar: {
      flexDirection: "row",
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 4,
      borderWidth: 1,
      borderColor: c.border,
    },
    tabWrapper: { flex: 1, borderRadius: 10, overflow: "hidden" },
    tab: {
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    tabActive: {
      backgroundColor: c.primary,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    label: { fontWeight: '600', fontSize: 13, color: c["muted-foreground"] },
    labelActive: { fontWeight: '700', fontSize: 13, color: c.white },
  });

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },

    selectorBar: {
      backgroundColor: c.card,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },

    tabScroll: { flex: 1 },
    tabContent: { padding: 16, gap: 14, backgroundColor: c.background },

    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.background,
      padding: 24,
    },
    loadingText: { fontSize: 14, color: c["muted-foreground"], marginTop: 10 },

    emptyCard: {
      backgroundColor: c.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      padding: 32,
      alignItems: "center",
      gap: 12,
      maxWidth: 320,
      shadowColor: c.primary,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: c["surface-muted"],
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: { fontWeight: '700',
      fontSize: 16,
      color: c.foreground,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 13,
      color: c["muted-foreground"],
      textAlign: "center",
      lineHeight: 20,
    },
    emptyBtn: {
      paddingHorizontal: 26,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: c.primary,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      marginTop: 6,
    },
    emptyBtnText: { fontWeight: '700',
      color: c.white,
      fontSize: 14,
      letterSpacing: 0.2,
    },

    emptyTab: { alignItems: "center", paddingVertical: 60, gap: 10 },
    emptyTabTitle: { fontWeight: '700', fontSize: 15, color: c.foreground },
    emptyTabSubtitle: {
      fontSize: 13,
      color: c["muted-foreground"],
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 260,
    },
  });

  return { tb, styles };
}

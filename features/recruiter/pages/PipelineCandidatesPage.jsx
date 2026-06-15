import { useState, useEffect, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useCompany } from "../../../features/companies/pages/CompanyLayout";
import {
  getPipelineCandidates,
  getJobStages,
  moveToStage,
} from "../services/candidatesPipline.service";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import {
  FONT_FAMILY,
  FONT_FAMILY_MEDIUM,
  FONT_FAMILY_SEMIBOLD,
  FONT_FAMILY_BOLD,
  FONT_FAMILY_EXTRABOLD,
} from "../../../src/fonts";
import AutoAdvanceModal from "../components/AutoAdvanceModal";
import { supabase } from "../../../shared/services/supabase";

const STAGE_TYPE_COLORS = {
  cv_review: "#6b7280",
  shortlist: "#f59e0b",
  screening: "#f59e0b",
  assessment_test: "#8b5cf6",
  coding_test: "#8b5cf6",
  video_interview: "#3b82f6",
  technical_interview: "#3b82f6",
  hr_interview: "#3b82f6",
  manager_interview: "#ec4899",
  ai_screening: "#8b5cf6",
  offer: "#10b981",
  default: "#6b7280",
};

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

function createStyles(c) {
  return StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 14, fontFamily: FONT_FAMILY },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.primary,
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 8,
    },
    jobSelector: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    jobSelectorText: {
      flex: 1,
      fontSize: 15,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c["destructive-foreground"],
    },
    autoAdvanceBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.15)",
      justifyContent: "center",
      alignItems: "center",
    },
    infoBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 6,
      backgroundColor: c.card,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    infoText: {
      fontSize: 13,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c.primary,
      flex: 1,
    },
    infoHint: {
      fontSize: 11,
      color: c["muted-foreground"],
      fontFamily: FONT_FAMILY,
    },
    boardScroll: { flex: 1 },
    board: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 20,
      gap: 14,
      alignItems: "flex-start",
    },

    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
    column: { width: 240, maxHeight: "100%" },

    columnHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    stageDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    columnTitle: { fontSize: 14, fontFamily: FONT_FAMILY_BOLD, flex: 1 },
    countBadge: {
      backgroundColor: c["surface-muted"],
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: c.border,
    },
    countText: { fontSize: 12, fontFamily: FONT_FAMILY_BOLD, color: c.primary },
    columnBody: { maxHeight: 500 },
    emptyColumn: {
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: c.border,
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyColumnText: { fontSize: 12, marginTop: 6, fontFamily: FONT_FAMILY },
    candidateCard: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: c.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    candidateTop: { flexDirection: "row", alignItems: "center", flex: 1 },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    avatarText: {
      color: c["destructive-foreground"],
      fontSize: 12,
      fontFamily: FONT_FAMILY_BOLD,
    },
    candidateInfo: { flex: 1 },
    candidateName: {
      fontSize: 13,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.foreground,
    },
    candidateRole: {
      fontSize: 11,
      color: c["muted-foreground"],
      marginTop: 1,
      fontFamily: FONT_FAMILY,
    },
    scoreBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    scoreText: { fontSize: 12, fontFamily: FONT_FAMILY_EXTRABOLD },
    rightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    advanceArrow: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: c.primary + "1a",
      justifyContent: "center",
      alignItems: "center",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: c.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "70%",
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    modalTitle: {
      fontSize: 17,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.foreground,
    },
    jobOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    jobOptionActive: { backgroundColor: c.primary + "08" },
    jobOptionInfo: { flex: 1 },
    jobOptionTitle: {
      fontSize: 15,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c.foreground,
    },
    jobOptionDept: {
      fontSize: 12,
      color: c["muted-foreground"],
      marginTop: 2,
      fontFamily: FONT_FAMILY,
    },
    emptyJobsText: {
      textAlign: "center",
      padding: 30,
      color: c["muted-foreground"],
      fontSize: 14,
      fontFamily: FONT_FAMILY,
    },
    moveModal: {
      backgroundColor: c.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "60%",
      paddingBottom: 40,
    },
    moveSubtitle: {
      fontSize: 13,
      color: c["muted-foreground"],
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      fontFamily: FONT_FAMILY,
    },
    moveOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    moveDot: { width: 12, height: 12, borderRadius: 6 },
    moveOptionText: {
      flex: 1,
      fontSize: 15,
      fontFamily: FONT_FAMILY_MEDIUM,
      color: c.foreground,
    },
    advanceAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: c.primary + "1a",
      borderWidth: 1,
      borderColor: c.primary + "33",
    },
    advanceAllBtnText: {
      fontSize: 11,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.primary,
    },
  });
}

export default function PipelineCandidatesPage() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation();
  const { company, jobs } = useCompany();
  const { t, language } = useTranslation();
  const isRtl = language === "ar";

  const [candidates, setCandidates] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [showAutoAdvanceModal, setShowAutoAdvanceModal] = useState(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs]);

  useEffect(() => {
    if (!selectedJobId) return;
    fetchData();
  }, [selectedJobId]);

  // Realtime: auto-refresh when applications change
  useEffect(() => {
    if (!company?.id) return;

    const channel = supabase
      .channel(`mobile-pipeline-${company.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "applications" },
        () => fetchData(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "applications" },
        () => fetchData(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [company?.id, selectedJobId]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: stagesData, error: stagesErr } =
        await getJobStages(selectedJobId);
      if (stagesErr) throw stagesErr;
      setStages(stagesData || []);

      const { data: candidatesData, error: candErr } =
        await getPipelineCandidates(company?.id);
      if (candErr) throw candErr;
      setCandidates(
        (candidatesData || []).filter(
          (c) => c.job_postings?.id === selectedJobId,
        ),
      );
    } catch (err) {
      console.error("Pipeline fetch error:", err);
    } finally {
      setLoading(false);
    }
  }
  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.order_index - b.order_index),
    [stages],
  );

  const candidatesByStage = useMemo(() => {
    const map = {};
    stages.forEach((s) => {
      map[s.id] = [];
    });

    candidates.forEach((c) => {
      const stageId = c.current_stage_id;
      if (stageId && map[stageId]) {
        map[stageId].push(c);
      }
    });
    return map;
  }, [stages, candidates]);

  const handleCandidateTap = (candidate) => {
    navigation.navigate("CandidateProfile", { applicationId: candidate.id });
  };

  const handleAdvanceOneStage = async (
    candidate,
    nextStageId,
    currentStageId,
  ) => {
    if (moving) return;

    const currentStage = stages.find((s) => s.id === currentStageId);
    const nextStage = stages.find((s) => s.id === nextStageId);
    const shortlistStage = stages.find((s) => s.stage_type === "shortlist");

    const isCvReview = currentStage?.stage_type === "cv_review";
    const minScore = currentStage?.min_score ?? 0;

    let score;
    if (isCvReview) {
      score = candidate.cv_score ?? candidate.composite_score ?? null;
    } else {
      const stageData = candidate.application_stages?.find(
        (as) =>
          as.recruitment_stages?.id === currentStageId ||
          as.stage_id === currentStageId,
      );
      score =
        stageData?.score ??
        stageData?.application_stage_evaluations?.[0]?.ai_score ??
        null;
    }

    const meetsScore = score != null && Number(score) >= minScore;

    const isToShortlist = shortlistStage && nextStage?.id === shortlistStage.id;

    if (isToShortlist) {
      if (!meetsScore) {
        Alert.alert(
          t("recruiter.cannot_move"),
          t("recruiter.score_below_minimum", {
            score: score != null ? Math.round(Number(score)) : "-",
            minScore,
          }),
        );
        return;
      }
      setShowAutoAdvanceModal(true);
      return;
    }

    if (!meetsScore) {
      Alert.alert(
        t("recruiter.cannot_move"),
        t("recruiter.score_below_minimum", {
          score: score != null ? Math.round(Number(score)) : "-",
          minScore,
        }),
      );
      return;
    }

    setMoving(true);

    // Optimistically update local state so the candidate doesn't vanish
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id ? { ...c, current_stage_id: nextStageId } : c,
      ),
    );

    try {
      const { error } = await moveToStage(candidate.id, nextStageId);
      if (error) {
        // Rollback on failure
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidate.id
              ? { ...c, current_stage_id: currentStageId }
              : c,
          ),
        );
        Alert.alert(t("recruiter.cannot_move"), error.message);
      } else {
        fetchData();
      }
    } catch (err) {
      // Rollback on exception
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidate.id
            ? { ...c, current_stage_id: currentStageId }
            : c,
        ),
      );
      Alert.alert(t("recruiter.error"), err.message);
    } finally {
      setMoving(false);
    }
  };

  const handleAutoAdvanceComplete = (advancedCount) => {
    if (advancedCount > 0) {
      Alert.alert(
        t("recruiter.auto_advance"),
        t("recruiter.auto_advanced", { count: advancedCount }),
      );
      fetchData();
    }
  };

  const handleAdvanceAll = async (stageId) => {
    const sortedStages = [...stages].sort(
      (a, b) => a.order_index - b.order_index,
    );

    const currentIndex = sortedStages.findIndex((s) => s.id === stageId);
    const nextStage = sortedStages[currentIndex + 1];

    if (!nextStage) return;

    const shortlistStage = stages.find((s) => s.stage_type === "shortlist");

    const isBeforeShortlist =
      shortlistStage && nextStage.id === shortlistStage.id;

    const currentStageCheck = stages.find((s) => s.id === stageId);

    const stageCandidates = candidatesByStage[stageId] || [];

    const currentStage = stages.find((s) => s.id === stageId);

    const isCvReview = currentStage?.stage_type === "cv_review";

    const eligible = stageCandidates.filter((c) => {
      const minScore = currentStage?.min_score ?? 0;

      if (isCvReview) {
        // cv_review uses cv_score primarily, composite_score as fallback
        const score = c.cv_score ?? c.composite_score ?? null;
        return score != null && Number(score) >= minScore;
      }

      const stageData = c.application_stages?.find(
        (as) =>
          as.recruitment_stages?.id === stageId || as.stage_id === stageId,
      );

      const score =
        stageData?.score ??
        stageData?.application_stage_evaluations?.[0]?.ai_score ??
        null;

      return score != null && Number(score) >= minScore;
    });

    // If the next stage is the shortlist stage, route through the AutoAdvanceModal
    // instead of moving directly — but only if at least one candidate in this
    // stage meets the min score requirement.
    if (isBeforeShortlist) {
      if (eligible.length === 0) {
        Alert.alert(
          t("recruiter.cannot_move"),
          t("recruiter.advance_all_score_too_low", {
            minScore: currentStage?.min_score ?? 0,
          }),
        );
        return;
      }
      setShowAutoAdvanceModal(true);
      return;
    }

    // Skip locked check for cv_review — it's always locked by design but must be actionable
    if (nextStage.is_locked && currentStageCheck?.stage_type !== "cv_review")
      return;

    if (eligible.length === 0) {
      Alert.alert(
        t("recruiter.advance_all"),
        t("recruiter.no_eligible_candidates"),
      );
      return;
    }

    Alert.alert(
      t("recruiter.advance_all"),
      t("recruiter.advance_all_confirm", {
        count: eligible.length,
        stage: nextStage.name,
      }),
      [
        { text: t("recruiter.cancel"), style: "cancel" },
        {
          text: t("recruiter.confirm"),

          onPress: async () => {
            setMoving(true);
            try {
              const results = await Promise.all(
                eligible.map((c) => moveToStage(c.id, nextStage.id)),
              );
              const errors = results.filter((r) => r?.error);
              if (errors.length > 0) {
                Alert.alert(t("recruiter.error"), errors[0].error.message);
              }
              fetchData();
            } catch (err) {
              Alert.alert(t("recruiter.error"), err.message);
            } finally {
              setMoving(false);
            }
          },
        },
      ],
    );
  };
  const precedingStageCandidates = useMemo(() => {
    const shortlistStage = stages.find((s) => s.stage_type === "shortlist");
    if (!shortlistStage) return [];
    const preceding = stages
      .filter((s) => s.order_index < shortlistStage.order_index)
      .sort((a, b) => b.order_index - a.order_index)[0];
    if (!preceding) return [];
    return candidatesByStage[preceding.id] || [];
  }, [stages, candidatesByStage]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const styles = createStyles(c);

  function CandidateCard({
    candidate,
    stageColor,
    stageType,
    onTap,
    onAdvance,
  }) {
    const app = candidate;
    const name = app.profiles?.full_name || t("recruiter.unknown");
    const score = app.composite_score;
    const initials = getInitials(name);

    const isOfferStage = stageType === "offer";

    const scoreColor =
      score >= 80 ? c.success : score >= 60 ? c.warning : c["muted-foreground"];
    const scoreBg =
      score >= 80
        ? `${c.success}1a`
        : score >= 60
          ? `${c.warning}1a`
          : c["surface-muted"];

    const advanceIcon = isRtl ? "chevron-back" : "chevron-forward";

    return (
      <TouchableOpacity
        style={[
          styles.candidateCard,
          isRtl && { flexDirection: "row-reverse" },
        ]}
        activeOpacity={0.8}
        onPress={() => onTap(app)}
      >
        <View
          style={[
            styles.candidateTop,
            isRtl && { flexDirection: "row-reverse" },
          ]}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: stageColor,
                marginRight: isRtl ? 0 : 10,
                marginLeft: isRtl ? 10 : 0,
              },
            ]}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.candidateInfo}>
            <Text style={styles.candidateName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.candidateRole} numberOfLines={1}>
              {app.job_postings?.title || ""}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.rightActions,
            isRtl && { flexDirection: "row-reverse" },
          ]}
        >
          {isOfferStage ? (
            <View
              style={[styles.scoreBadge, { backgroundColor: `${c.success}1a` }]}
            >
              <Ionicons name="checkmark-circle" size={16} color={c.success} />
            </View>
          ) : (
            score != null && (
              <View style={[styles.scoreBadge, { backgroundColor: scoreBg }]}>
                <Text style={[styles.scoreText, { color: scoreColor }]}>
                  {Math.round(score)}
                </Text>
              </View>
            )
          )}
          {onAdvance && (
            <TouchableOpacity
              onPress={onAdvance}
              style={styles.advanceArrow}
              disabled={moving}
            >
              <Ionicons name={advanceIcon} size={18} color={c.primary} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading && candidates.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: c.background },
        ]}
      >
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.loadingText, { color: c["muted-foreground"] }]}>
          {t("recruiter.loading")}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Job Selector Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.jobSelector}
          onPress={() => setShowJobPicker(true)}
        >
          <Ionicons
            name="briefcase-outline"
            size={18}
            color={c["destructive-foreground"]}
          />
          <Text
            style={[styles.jobSelectorText, isRtl && styles.textRight]}
            numberOfLines={1}
          >
            {selectedJob?.title || t("recruiter.select_job")}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={c["destructive-foreground"]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.autoAdvanceBtn}
          onPress={() => setShowAutoAdvanceModal(true)}
        >
          <Ionicons
            name="flash-outline"
            size={16}
            color={c["destructive-foreground"]}
          />
        </TouchableOpacity>
      </View>

      {/* Pipeline Info */}
      <View style={styles.infoBar}>
        <Ionicons name="git-network-outline" size={16} color={c.primary} />
        <Text style={styles.infoText}>
          {t("recruiter.candidates_in_pipeline", { count: candidates.length })}
        </Text>
        <Text style={styles.infoHint}>{t("recruiter.advance_hint")}</Text>
      </View>

      {/* Kanban Board */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.boardScroll}
      >
        <View style={[styles.board, isRtl && styles.rowReverse]}>
          {sortedStages.map((stage, stageIndex) => {
            const nextStage = sortedStages[stageIndex + 1];
            const stageCandidates = candidatesByStage[stage.id] || [];
            console.log("STAGE:", stage.name, {
              stage_type: stage.stage_type,
              is_locked: stage.is_locked,
              nextStage: nextStage?.name,
              candidatesCount: stageCandidates.length,
            });
            const stageColor =
              STAGE_TYPE_COLORS[stage.stage_type] || STAGE_TYPE_COLORS.default;
            return (
              <View key={stage.id} style={styles.column}>
                <View style={styles.columnHeader}>
                  <View
                    style={[
                      styles.stageDot,
                      {
                        backgroundColor: stageColor,
                        marginRight: isRtl ? 0 : 8,
                        marginLeft: isRtl ? 8 : 0,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.columnTitle,
                      { color: c.foreground },
                      isRtl && styles.textRight,
                    ]}
                    numberOfLines={1}
                  >
                    {stage.name}
                  </Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {stageCandidates.length}
                    </Text>
                  </View>
                  {nextStage &&
                    (!stage.is_locked || stage.stage_type === "cv_review") &&
                    stageCandidates.length > 0 && (
                      <TouchableOpacity
                        style={[styles.advanceAllBtn, { marginLeft: 6 }]}
                        onPress={() => handleAdvanceAll(stage.id)}
                        disabled={moving}
                      >
                        <Ionicons name="flash" size={11} color={c.primary} />
                        <Text style={styles.advanceAllBtnText}>All</Text>
                      </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                  style={styles.columnBody}
                  showsVerticalScrollIndicator={false}
                >
                  {stageCandidates.length === 0 ? (
                    <View style={styles.emptyColumn}>
                      <Ionicons
                        name="move-outline"
                        size={24}
                        color={c.border}
                      />
                      <Text
                        style={[styles.emptyColumnText, { color: c.border }]}
                      >
                        {t("recruiter.drop_here")}
                      </Text>
                    </View>
                  ) : (
                    stageCandidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        stageColor={stageColor}
                        stageType={stage.stage_type}
                        onTap={handleCandidateTap}
                        onAdvance={
                          nextStage &&
                          (!nextStage.is_locked ||
                            stage.stage_type === "cv_review")
                            ? () =>
                                handleAdvanceOneStage(
                                  candidate,
                                  nextStage.id,
                                  stage.id,
                                )
                            : null
                        }
                      />
                    ))
                  )}
                </ScrollView>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Job Picker Modal */}
      <Modal
        visible={showJobPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJobPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("recruiter.select_a_job_title")}
              </Text>
              <TouchableOpacity onPress={() => setShowJobPicker(false)}>
                <Ionicons name="close" size={24} color={c.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {jobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={[
                    styles.jobOption,
                    job.id === selectedJobId && styles.jobOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedJobId(job.id);
                    setShowJobPicker(false);
                  }}
                >
                  <Ionicons
                    name={
                      job.id === selectedJobId
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={
                      job.id === selectedJobId
                        ? c.primary
                        : c["muted-foreground"]
                    }
                  />
                  <View style={styles.jobOptionInfo}>
                    <Text
                      style={[
                        styles.jobOptionTitle,
                        job.id === selectedJobId && { color: c.primary },
                      ]}
                    >
                      {job.title}
                    </Text>
                    {job.department && (
                      <Text style={styles.jobOptionDept}>{job.department}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              {jobs.length === 0 && (
                <Text style={styles.emptyJobsText}>
                  {t("recruiter.no_jobs_available")}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AutoAdvanceModal
        visible={showAutoAdvanceModal}
        onClose={() => setShowAutoAdvanceModal(false)}
        selectedJobId={selectedJobId}
        precedingStageCandidates={precedingStageCandidates}
        onComplete={handleAutoAdvanceComplete}
      />
    </View>
  );
}

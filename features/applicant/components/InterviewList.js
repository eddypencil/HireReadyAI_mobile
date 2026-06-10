import { useState } from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APPLICATION_STAGE } from "../../../shared/constants/enums";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

const stageColorMap = {
  [APPLICATION_STAGE.interview]: 'stage-interview',
  [APPLICATION_STAGE.shortlisted]: 'stage-interview',
  [APPLICATION_STAGE.hired]: 'stage-hired',
  [APPLICATION_STAGE.rejected]: 'destructive',
  [APPLICATION_STAGE.cv_screening]: 'stage-screening',
  [APPLICATION_STAGE.ai_screening]: 'stage-final',
  [APPLICATION_STAGE.assessment_test]: 'stage-assessment',
  [APPLICATION_STAGE.coding_test]: 'stage-final',
  [APPLICATION_STAGE.video_interview]: 'stage-screening',
  [APPLICATION_STAGE.technical_interview]: 'stage-interview',
  [APPLICATION_STAGE.hr_interview]: 'stage-assessment',
  [APPLICATION_STAGE.manager_interview]: 'stage-final',
  [APPLICATION_STAGE.background_check]: 'warning',
  [APPLICATION_STAGE.offer]: 'success',
};

const stageLabelMap = {
  [APPLICATION_STAGE.interview]: "Interview",
  [APPLICATION_STAGE.shortlisted]: "Shortlisted",
  [APPLICATION_STAGE.hired]: "Hired",
  [APPLICATION_STAGE.rejected]: "Rejected",
  [APPLICATION_STAGE.cv_screening]: "CV Screening",
  [APPLICATION_STAGE.ai_screening]: "AI Screening",
  [APPLICATION_STAGE.assessment_test]: "Assessment Test",
  [APPLICATION_STAGE.coding_test]: "Coding Test",
  [APPLICATION_STAGE.video_interview]: "Video Interview",
  [APPLICATION_STAGE.technical_interview]: "Technical Interview",
  [APPLICATION_STAGE.hr_interview]: "HR Interview",
  [APPLICATION_STAGE.manager_interview]: "Manager Interview",
  [APPLICATION_STAGE.background_check]: "Background Check",
  [APPLICATION_STAGE.offer]: "Offer",
};

const defaultLabel = "Processing";

const INTERVIEW_STAGE_TYPES = [
  APPLICATION_STAGE.assessment_test,
  APPLICATION_STAGE.coding_test,
  APPLICATION_STAGE.video_interview,
  APPLICATION_STAGE.technical_interview,
  APPLICATION_STAGE.hr_interview,
  APPLICATION_STAGE.manager_interview,
  APPLICATION_STAGE.ai_screening,
];

function stageStyle(c) {
  return {
    bg: `${c}1a`,
    text: c,
    border: `${c}40`,
    dot: c,
  };
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StagePill({ label, cfg }) {
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: cfg.bg,
      borderWidth: 1,
      borderColor: cfg.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
    }}>
      <View style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: cfg.dot,
      }} />
      <Text style={{
        fontSize: 11,
        fontWeight: "600",
        color: cfg.text,
        letterSpacing: 0.1,
      }}>{label}</Text>
    </View>
  );
}

export default function InterviewList({ applications }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const [activeTab, setActiveTab] = useState("all_interviews");

  const getStageStatus = (app) => {
    const currentStageId = app.current_stage_id;
    if (!currentStageId) return null;

    const recStage = app.current_recruitment_stage;
    if (!recStage || !INTERVIEW_STAGE_TYPES.includes(recStage.stage_type)) return null;

    const appStage = (app.application_stages || []).find(
      (s) => s.stage_id === currentStageId,
    );

    const hasScore = appStage?.score != null;

    if (!hasScore) {
      return {
        status: "in_progress",
        label: recStage.name || t("applicant.interview_stage"),
        stageType: recStage.stage_type,
      };
    }

    return { status: "completed", label: "Completed" };
  };

  const interviewProcesses = applications?.filter((app) => {
    return getStageStatus(app) !== null;
  }) || [];

  const countAll = interviewProcesses.length;
  const countActive = interviewProcesses.filter(
    (app) => getStageStatus(app)?.status === "in_progress",
  ).length;
  const countCompleted = interviewProcesses.filter(
    (app) => getStageStatus(app)?.status === "completed",
  ).length;
  const countRejected = interviewProcesses.filter(
    (app) => app.current_stage === APPLICATION_STAGE.rejected,
  ).length;

  const filtered = interviewProcesses.filter((app) => {
    const ss = getStageStatus(app);
    if (activeTab === "all_interviews") return true;
    if (activeTab === "active") return ss?.status === "in_progress";
    if (activeTab === "completed") return ss?.status === "completed";
    if (activeTab === "rejected") return app.current_stage === APPLICATION_STAGE.rejected;
    return true;
  });

  const tabs = [
    { key: "all_interviews", label: t("applicant.all_processes"), count: countAll },
    { key: "active", label: t("applicant.active"), count: countActive },
    { key: "completed", label: t("applicant.completed"), count: countCompleted },
    { key: "rejected", label: t("applicant.rejected"), count: countRejected },
  ];

  if (interviewProcesses.length === 0) {
    return (
      <View style={{
        backgroundColor: c.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.border,
        overflow: "hidden",
      }}>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: c['surface-muted'],
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Ionicons name="pulse-outline" size={16} color={c.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: c.foreground }}>
                {t("applicant.status_management")}
              </Text>
              <Text style={{ fontSize: 11, color: c['muted-foreground'], marginTop: 1 }}>
                {t("applicant.track_interviews")}
              </Text>
            </View>
          </View>
        </View>
        <View style={{
          borderTopWidth: 1,
          borderTopColor: c.border,
          padding: 36,
          alignItems: "center",
        }}>
          <Text style={{ fontSize: 13, color: c['muted-foreground'] }}>
            {t("applicant.no_interviews")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    }}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: c['surface-muted'],
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Ionicons name="pulse-outline" size={16} color={c.primary} />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: c.foreground }}>
              {t("applicant.status_management")}
            </Text>
            <Text style={{ fontSize: 11, color: c['muted-foreground'], marginTop: 1 }}>
              {t("applicant.track_interviews")}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            marginLeft: -20,
            marginRight: -20,
          }}
          contentContainerStyle={{
            flexDirection: "row",
            paddingLeft: 20,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? c.primary : "transparent",
                }}
              >
                <Text style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: isActive ? c.primary : c['muted-foreground'],
                }}>
                  {tab.label}
                </Text>
                <View style={{
                  backgroundColor: isActive ? c.primary : c['surface-muted'],
                  borderRadius: 999,
                  paddingHorizontal: 7,
                  paddingVertical: 1,
                }}>
                  <Text style={{
                    fontSize: 9,
                    fontWeight: "800",
                    color: isActive ? c['destructive-foreground'] : c['muted-foreground'],
                  }}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ padding: 20 }}>
        {filtered.length === 0 ? (
          <View style={{
            padding: 28,
            alignItems: "center",
            backgroundColor: c['surface-muted'],
            borderRadius: 10,
            borderWidth: 1,
            borderColor: c.border,
            borderStyle: "dashed",
          }}>
            <Text style={{ fontSize: 12, color: c['muted-foreground'] }}>
              {t("applicant.no_records")}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ maxHeight: 420 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
          <View style={{ gap: 9 }}>
            {filtered.map((app) => {
              const job = app.job_postings;
              const company = job?.companies;
              const stageStatus = getStageStatus(app);
              const isActive = stageStatus?.status === "in_progress";

              let displayLabel;
              let cfg;
              if (stageStatus) {
                const tokenKey = stageColorMap[stageStatus.stageType] || 'stage-final';
                cfg = stageStyle(c[tokenKey]);
                displayLabel = stageStatus.label;
              } else {
                const stageVal = app.current_stage;
                displayLabel = stageLabelMap[stageVal] || defaultLabel;
                const tokenKey = stageColorMap[stageVal] || 'stage-final';
                cfg = stageStyle(c[tokenKey]);
              }

              return (
                <View key={app.id} style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  backgroundColor: isActive ? c['surface-muted'] : c.card,
                  borderWidth: 1,
                  borderColor: isActive ? c['stage-applied'] : c.border,
                  borderRadius: 10,
                  padding: 13,
                }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <Text style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: c.foreground,
                      }}>
                        {job?.title || t("applicant.unknown_position")}
                      </Text>
                      <StagePill label={displayLabel} cfg={cfg} />
                    </View>
                    <Text style={{
                      fontSize: 12,
                      color: c['muted-foreground'],
                      fontWeight: "500",
                      marginBottom: 5,
                    }}>
                      {company?.name || t("applicant.unknown_company")}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Text style={{
                        backgroundColor: c['surface-muted'],
                        borderWidth: 1,
                        borderColor: c.border,
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        fontSize: 10,
                        fontWeight: "600",
                        color: c['muted-foreground'],
                        fontFamily: "monospace",
                      }}>
                        {t("applicant.id")}: {app.candidate_profile_id?.substring(0, 8)}
                      </Text>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c['stage-applied'] }} />
                      <Text style={{ fontSize: 11, color: c['muted-foreground'] }}>
                        {t("applicant.applied")} {formatDate(app.applied_at)}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {app.cv_file_url && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(app.cv_file_url)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          borderWidth: 1,
                          borderColor: c.border,
                          borderRadius: 8,
                          paddingHorizontal: 13,
                          paddingVertical: 7,
                        }}
                      >
                        <Ionicons name="document-outline" size={10} color={c.primary} />
                        <Text style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: c.primary,
                        }}>{t("applicant.view_cv")}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

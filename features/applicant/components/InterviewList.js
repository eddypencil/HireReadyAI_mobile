import { useState } from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APPLICATION_STAGE } from "../../../shared/constants/enums";
import { colors } from "../../../src/theme";

const stageConfig = {
  [APPLICATION_STAGE.interview]: {
    label: "Interview",
    bg: "rgba(1,73,124,0.1)",
    text: "#01497c",
    border: "rgba(1,73,124,0.25)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.shortlisted]: {
    label: "Shortlisted",
    bg: "rgba(44,125,160,0.12)",
    text: "#01497c",
    border: "rgba(44,125,160,0.3)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.hired]: {
    label: "Hired",
    bg: "rgba(22,163,74,0.1)",
    text: "#15803d",
    border: "rgba(22,163,74,0.25)",
    dot: "#22c55e",
  },
  [APPLICATION_STAGE.rejected]: {
    label: "Rejected",
    bg: "rgba(185,28,28,0.08)",
    text: "#b91c1c",
    border: "rgba(185,28,28,0.2)",
    dot: "#ef4444",
  },
  [APPLICATION_STAGE.cv_screening]: {
    label: "CV Screening",
    bg: "rgba(42,111,151,0.1)",
    text: "#2a6f97",
    border: "rgba(42,111,151,0.25)",
    dot: "#2a6f97",
  },
  [APPLICATION_STAGE.ai_screening]: {
    label: "AI Screening",
    bg: "rgba(70,143,175,0.12)",
    text: "#01497c",
    border: "rgba(70,143,175,0.3)",
    dot: "#468faf",
  },
  [APPLICATION_STAGE.assessment_test]: {
    label: "Assessment Test",
    bg: "rgba(44,125,160,0.12)",
    text: "#2c7da0",
    border: "rgba(44,125,160,0.3)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.coding_test]: {
    label: "Coding Test",
    bg: "rgba(1,73,124,0.1)",
    text: "#01497c",
    border: "rgba(1,73,124,0.28)",
    dot: "#01497c",
  },
  [APPLICATION_STAGE.video_interview]: {
    label: "Video Interview",
    bg: "rgba(97,165,194,0.13)",
    text: "#2a6f97",
    border: "rgba(97,165,194,0.35)",
    dot: "#61a5c2",
  },
  [APPLICATION_STAGE.technical_interview]: {
    label: "Technical Interview",
    bg: "rgba(1,73,124,0.1)",
    text: "#01497c",
    border: "rgba(1,73,124,0.28)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.hr_interview]: {
    label: "HR Interview",
    bg: "rgba(70,143,175,0.12)",
    text: "#01497c",
    border: "rgba(70,143,175,0.3)",
    dot: "#468faf",
  },
  [APPLICATION_STAGE.manager_interview]: {
    label: "Manager Interview",
    bg: "rgba(42,111,151,0.12)",
    text: "#2a6f97",
    border: "rgba(42,111,151,0.3)",
    dot: "#2a6f97",
  },
  [APPLICATION_STAGE.background_check]: {
    label: "Background Check",
    bg: "rgba(234,179,8,0.1)",
    text: "#854d0e",
    border: "rgba(234,179,8,0.25)",
    dot: "#eab308",
  },
  [APPLICATION_STAGE.offer]: {
    label: "Offer",
    bg: "rgba(22,163,74,0.12)",
    text: "#15803d",
    border: "rgba(22,163,74,0.3)",
    dot: "#22c55e",
  },
};

const defaultStage = {
  label: "Processing",
  bg: "rgba(42,111,151,0.1)",
  text: "#2a6f97",
  border: "rgba(42,111,151,0.25)",
  dot: "#2a6f97",
};

const INTERVIEW_STAGE_TYPES = [
  APPLICATION_STAGE.assessment_test,
  APPLICATION_STAGE.coding_test,
  APPLICATION_STAGE.video_interview,
  APPLICATION_STAGE.technical_interview,
  APPLICATION_STAGE.hr_interview,
  APPLICATION_STAGE.manager_interview,
  APPLICATION_STAGE.ai_screening,
];

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
        label: recStage.name || "Interview Stage",
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
    { key: "all_interviews", label: "All Processes", count: countAll },
    { key: "active", label: "Active", count: countActive },
    { key: "completed", label: "Completed", count: countCompleted },
    { key: "rejected", label: "Rejected", count: countRejected },
  ];

  if (interviewProcesses.length === 0) {
    return (
      <View style={{
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Ionicons name="pulse-outline" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>
                Status Managment
              </Text>
              <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 1 }}>
                Track your interview stages
              </Text>
            </View>
          </View>
        </View>
        <View style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: 36,
          alignItems: "center",
        }}>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            No interview processes yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: colors.white,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    }}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Ionicons name="pulse-outline" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>
              Status Management
            </Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 1 }}>
              Track your interview stages
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
            borderBottomColor: colors.border,
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
                  borderBottomColor: isActive ? colors.primary : "transparent",
                }}
              >
                <Text style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: isActive ? colors.primary : colors.mutedForeground,
                }}>
                  {tab.label}
                </Text>
                <View style={{
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderRadius: 999,
                  paddingHorizontal: 7,
                  paddingVertical: 1,
                }}>
                  <Text style={{
                    fontSize: 9,
                    fontWeight: "800",
                    color: isActive ? colors.white : colors.mutedForeground,
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
            backgroundColor: colors.surface,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: "dashed",
          }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              No records found
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
              let stageCfg;
              if (stageStatus) {
                stageCfg = stageConfig[stageStatus.stageType] || defaultStage;
                displayLabel = stageStatus.label;
              } else {
                stageCfg = stageConfig[app.current_stage] || defaultStage;
                displayLabel = stageCfg.label;
              }

              return (
                <View key={app.id} style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  backgroundColor: isActive ? colors.surface : colors.white,
                  borderWidth: 1,
                  borderColor: isActive ? "#89c2d9" : colors.border,
                  borderRadius: 10,
                  padding: 13,
                }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <Text style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: colors.foreground,
                      }}>
                        {job?.title || "Unknown Position"}
                      </Text>
                      <StagePill label={displayLabel} cfg={stageCfg} />
                    </View>
                    <Text style={{
                      fontSize: 12,
                      color: colors.mutedForeground,
                      fontWeight: "500",
                      marginBottom: 5,
                    }}>
                      {company?.name || "Unknown Company"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Text style={{
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        fontSize: 10,
                        fontWeight: "600",
                        color: colors.mutedForeground,
                        fontFamily: "monospace",
                      }}>
                        ID: {app.candidate_profile_id?.substring(0, 8)}
                      </Text>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#89c2d9" }} />
                      <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                        Applied {formatDate(app.applied_at)}
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
                          borderColor: colors.border,
                          borderRadius: 8,
                          paddingHorizontal: 13,
                          paddingVertical: 7,
                        }}
                      >
                        <Ionicons name="document-outline" size={10} color={colors.primary} />
                        <Text style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: colors.primary,
                        }}>View CV</Text>
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
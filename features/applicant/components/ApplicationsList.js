import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APPLICATION_STAGE } from "../../../shared/constants/enums";
import { colors } from "../../../src/theme";

const stageConfig = {
  [APPLICATION_STAGE.applied]: {
    label: "Applied",
    bg: "rgba(137,194,217,0.15)",
    text: "#2c7da0",
    border: "rgba(137,194,217,0.4)",
    dot: "#89c2d9",
  },
  [APPLICATION_STAGE.screening]: {
    label: "Screening",
    bg: "rgba(97,165,194,0.15)",
    text: "#2a6f97",
    border: "rgba(97,165,194,0.4)",
    dot: "#61a5c2",
  },
  [APPLICATION_STAGE.shorListed]: {
    label: "Shortlisted",
    bg: "rgba(44,125,160,0.12)",
    text: "#01497c",
    border: "rgba(44,125,160,0.35)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.interview]: {
    label: "Interview",
    bg: "rgba(1,73,124,0.12)",
    text: "#01497c",
    border: "rgba(1,73,124,0.3)",
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
  cv_review: {
    label: "CV Review",
    bg: "rgba(42,111,151,0.1)",
    text: "#2a6f97",
    border: "rgba(42,111,151,0.25)",
    dot: "#2a6f97",
  },
  shortlist: {
    label: "Shortlisting",
    bg: "rgba(44,125,160,0.12)",
    text: "#01497c",
    border: "rgba(44,125,160,0.3)",
    dot: "#2c7da0",
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

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StagePill({ label, config }) {
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: config.bg,
      borderWidth: 1,
      borderColor: config.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
    }}>
      <View style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: config.dot,
      }} />
      <Text style={{
        fontSize: 11,
        fontWeight: "600",
        color: config.text,
        letterSpacing: 0.1,
      }}>{label}</Text>
    </View>
  );
}

function getActiveStage(app) {
  if (!app.application_stages || !Array.isArray(app.application_stages)) return null;
  const sorted = [...app.application_stages].sort((a, b) => {
    return (a.recruitment_stages?.order_index || 0) - (b.recruitment_stages?.order_index || 0);
  });
  const inProgress = sorted.find((s) => s.status === "in_progress");
  if (inProgress) return inProgress;
  return sorted.find((s) => s.status === "pending");
}

export default function ApplicationsList({ applications, onViewJob }) {
  if (!applications || applications.length === 0) {
    return (
      <View style={{
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 24,
        alignItems: "center",
      }}>
        <View style={{
          padding: 48,
          alignItems: "center",
          gap: 8,
        }}>
          <Ionicons name="briefcase-outline" size={32} color={colors.border} />
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            No applications yet
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
      <View style={{
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Ionicons name="layers-outline" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>
              Applications
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 1 }}>
              Track your job applications
            </Text>
          </View>
        </View>
        {applications.length > 0 && (
          <View style={{
            backgroundColor: colors.primary,
            borderRadius: 999,
            width: 22,
            height: 22,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.white }}>
              {applications.length}
            </Text>
          </View>
        )}
      </View>

      <View style={{ padding: 20 }}>
        <ScrollView
          style={{ maxHeight: 420 }}
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          <View style={{ gap: 12 }}>
          {applications.map((app) => {
            const job = app.job_postings;
            const company = job?.companies;
            const activeStage = getActiveStage(app);

            let displayLabel = app.current_stage;
            let stageStyle = stageConfig[app.current_stage] || defaultStage;

            if (activeStage) {
              const type = activeStage.recruitment_stages?.stage_type;
              displayLabel = activeStage.recruitment_stages?.name || "Processing";
              stageStyle = stageConfig[type] || defaultStage;
            } else if (stageConfig[app.current_stage]) {
              displayLabel = stageConfig[app.current_stage].label;
            }

            return (
              <View key={app.id} style={{
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
              }}>
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}>
                  <Text style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.foreground,
                    flex: 1,
                    paddingRight: 8,
                  }}>
                    {job?.title || "Unknown Position"}
                  </Text>
                  <StagePill label={displayLabel} config={stageStyle} />
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 }}>
                  <Ionicons name="briefcase-outline" size={12} color={colors.mutedForeground} />
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, fontWeight: "500" }}>
                    {company?.name || "Unknown Company"}
                  </Text>
                </View>

                <View style={{
                  flexDirection: "row",
                  gap: 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.surface,
                  paddingTop: 8,
                  alignItems: "center",
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="time-outline" size={10} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                      Applied {formatDate(app.applied_at)}
                    </Text>
                  </View>
                  {job?.closed_at && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Ionicons name="calendar-outline" size={10} color={colors.mutedForeground} />
                      <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                        Closes {formatDate(job.closed_at)}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => onViewJob?.(job?.id)}
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>
                    View Job
                  </Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        </ScrollView>
      </View>
    </View>
  );
}
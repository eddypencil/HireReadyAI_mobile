import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APPLICATION_STAGE } from "../../../shared/constants/enums";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

const stageColorMap = {
  [APPLICATION_STAGE.applied]: 'stage-applied',
  [APPLICATION_STAGE.screening]: 'stage-screening',
  [APPLICATION_STAGE.shorListed]: 'stage-interview',
  [APPLICATION_STAGE.interview]: 'stage-interview',
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
  cv_review: 'stage-assessment',
  shortlist: 'stage-interview',
};

const stageLabelMap = {
  [APPLICATION_STAGE.applied]: "Applied",
  [APPLICATION_STAGE.screening]: "Screening",
  [APPLICATION_STAGE.shorListed]: "Shortlisted",
  [APPLICATION_STAGE.interview]: "Interview",
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
  cv_review: "CV Review",
  shortlist: "Shortlisting",
};

const defaultLabel = "Processing";

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
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const defaultCfg = stageStyle(c['stage-final']);

  if (!applications || applications.length === 0) {
    return (
      <View style={{
        backgroundColor: c.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.border,
        padding: 24,
        alignItems: "center",
      }}>
        <View style={{
          padding: 48,
          alignItems: "center",
          gap: 8,
        }}>
          <Ionicons name="briefcase-outline" size={32} color={c.border} />
          <Text style={{ fontSize: 13, color: c['muted-foreground'] }}>
            {t("applicant.no_applications")}
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
      <View style={{
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: c['surface-muted'],
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Ionicons name="layers-outline" size={16} color={c.primary} />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: c.foreground }}>
              {t("applicant.applications")}
            </Text>
            <Text style={{ fontSize: 12, color: c['muted-foreground'], marginTop: 1 }}>
              {t("applicant.track_applications")}
            </Text>
          </View>
        </View>
        {applications.length > 0 && (
          <View style={{
            backgroundColor: c.primary,
            borderRadius: 999,
            width: 22,
            height: 22,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: c['destructive-foreground'] }}>
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

            let displayLabel;
            let cfg;

            if (activeStage) {
              const type = activeStage.recruitment_stages?.stage_type;
              displayLabel = activeStage.recruitment_stages?.name || stageLabelMap[type] || defaultLabel;
              const tokenKey = stageColorMap[type] || 'stage-final';
              cfg = stageStyle(c[tokenKey]);
            } else {
              const stageVal = app.current_stage;
              displayLabel = stageLabelMap[stageVal] || defaultLabel;
              const tokenKey = stageColorMap[stageVal] || 'stage-final';
              cfg = stageStyle(c[tokenKey]);
            }

            return (
              <View key={app.id} style={{
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
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
                    color: c.foreground,
                    flex: 1,
                    paddingRight: 8,
                  }}>
                    {job?.title || t("applicant.unknown_position")}
                  </Text>
                  <StagePill label={displayLabel} cfg={cfg} />
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 }}>
                  <Ionicons name="briefcase-outline" size={12} color={c['muted-foreground']} />
                  <Text style={{ fontSize: 12, color: c['muted-foreground'], fontWeight: "500" }}>
                    {company?.name || t("applicant.unknown_company")}
                  </Text>
                </View>

                <View style={{
                  flexDirection: "row",
                  gap: 12,
                  borderTopWidth: 1,
                  borderTopColor: c['surface-muted'],
                  paddingTop: 8,
                  alignItems: "center",
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="time-outline" size={10} color={c['muted-foreground']} />
                    <Text style={{ fontSize: 11, color: c['muted-foreground'] }}>
                      {t("applicant.applied")} {formatDate(app.applied_at)}
                    </Text>
                  </View>
                  {job?.closed_at && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Ionicons name="calendar-outline" size={10} color={c['muted-foreground']} />
                      <Text style={{ fontSize: 11, color: c['muted-foreground'] }}>
                        {t("applicant.closes")} {formatDate(job.closed_at)}
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
                    borderColor: c.border,
                    borderRadius: 8,
                    paddingVertical: 6,
                    backgroundColor: c.primary,
                    shadowColor: c.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: c['destructive-foreground'] }}>
                    {t("applicant.view_job")}
                  </Text>
                  <Ionicons name="arrow-forward" size={12} color={c['destructive-foreground']} />
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

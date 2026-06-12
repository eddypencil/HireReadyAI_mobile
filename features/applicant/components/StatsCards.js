import { View, Text } from "react-native";
import { APPLICATION_STAGE } from "../../../shared/constants/enums";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

const hasActiveInterviewStage = (app) => {
  const stages = app.application_stages;
  if (!stages || !Array.isArray(stages) || stages.length === 0) return false;
  return stages.some((s) => s.status === "in_progress" || s.status === "completed");
};

const isHired = (app) => {
  if (app.current_recruitment_stage?.stage_type === "offer") return true;
  if (app.current_stage === APPLICATION_STAGE.hired) return true;
  return false;
};

const isRejected = (app) => {
  const stages = app.application_stages;
  if (stages && Array.isArray(stages)) {
    if (stages.some((s) => s.status === "rejected")) return true;
  }
  if (app.current_stage === APPLICATION_STAGE.rejected) return true;
  return false;
};

export default function StatsCards({ applications }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;

  const total = applications?.length || 0;
  const interviewCount = applications?.filter(hasActiveInterviewStage).length || 0;
  const offerCount = applications?.filter(isHired).length || 0;
  const rejectedCount = applications?.filter(isRejected).length || 0;

  const stats = [
    {
      labelKey: "applicant.total_applications",
      value: total,
      color: c.primary,
    },
    {
      labelKey: "applicant.interviews",
      value: interviewCount,
      color: c.warning,
    },
    {
      labelKey: "applicant.offers",
      value: offerCount,
      color: c.success,
    },
    {
      labelKey: "applicant.rejected",
      value: rejectedCount,
      color: c.destructive,
      value: applications?.length || 0,
    },
    {
      labelKey: "applicant.interviews",
      value: applications?.filter(
        (a) => a.current_stage === APPLICATION_STAGE.interview
      ).length || 0,
    },
    {
      labelKey: "applicant.offers",
      value: applications?.filter(
        (a) => a.current_stage === APPLICATION_STAGE.hired
      ).length || 0,
    },
  ];

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {stats.map((s, i) => (
        <View key={i} style={{
          flex: 1, backgroundColor: c.card, borderRadius: 14, padding: 14,
          alignItems: "center", borderWidth: 1, borderColor: c.border,
        }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: s.color }}>{s.value}</Text>
          <Text style={{ fontSize: 11, color: c['muted-foreground'], marginTop: 2, textAlign: "center" }}>
            {t(s.labelKey)}
          </Text>
        </View>
      ))}
    </View>
  );
}

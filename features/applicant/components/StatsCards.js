import { View, Text } from "react-native";
import { APPLICATION_STAGE } from "../../../shared/constants/enums";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

export default function StatsCards({ applications }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;

  const stats = [
    {
      labelKey: "applicant.total_applications",
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
          <Text style={{ fontSize: 24, fontWeight: "800", color: c.foreground }}>{s.value}</Text>
          <Text style={{ fontSize: 11, color: c['muted-foreground'], marginTop: 2, textAlign: "center" }}>
            {t(s.labelKey)}
          </Text>
        </View>
      ))}
    </View>
  );
}

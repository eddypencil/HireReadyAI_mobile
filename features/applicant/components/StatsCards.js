import { View, Text } from "react-native";
import { APPLICATION_STAGE } from "../../../shared/constants/enums";
import { colors } from "../../../src/theme";

export default function StatsCards({ applications }) {
  const stats = [
    {
      label: "Total Applications",
      value: applications?.length || 0,
      icon: "document-text-outline",
    },
    {
      label: "Interviews",
      value: applications?.filter(
        (a) => a.current_stage === APPLICATION_STAGE.interview
      ).length || 0,
      icon: "calendar-outline",
    },
    {
      label: "Offers",
      value: applications?.filter(
        (a) => a.current_stage === APPLICATION_STAGE.hired
      ).length || 0,
      icon: "briefcase-outline",
    },
  ];

  return (
    <View style={{
      flexDirection: "row",
      gap: 10,
    }}>
      {stats.map((s, i) => (
        <View key={i} style={{
          flex: 1,
          backgroundColor: colors.white,
          borderRadius: 14,
          padding: 14,
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: "800",
            color: colors.foreground,
          }}>{s.value}</Text>
          <Text style={{
            fontSize: 11,
            color: colors.mutedForeground,
            marginTop: 2,
            textAlign: "center",
          }}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}
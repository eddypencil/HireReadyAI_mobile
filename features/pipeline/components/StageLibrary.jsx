import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { STAGE_LIBRARY } from "../constants/stageLibrary";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

const ICON_MAP = {
  FileText: "document-text-outline",
  Sparkles: "sparkles-outline",
  ClipboardList: "clipboard-outline",
  Code2: "code-slash-outline",
  Video: "videocam-outline",
  Cpu: "hardware-chip-outline",
  Users: "people-outline",
  UserCheck: "person-check-outline",
  ShieldCheck: "shield-checkmark-outline",
  Award: "trophy-outline",
};

export default function StageLibrary({ onAddStage }) {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  const c = theme.colors;
  const styles = createStyles(c);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>{t("pipeline.stage_library")}</Text>
        <Text style={styles.headerHint}>{t("pipeline.tap_to_append")}</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {STAGE_LIBRARY.map((item) => {
          const iconName = ICON_MAP[item.icon] || "document-text-outline";
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onAddStage(item)}
              style={[styles.stageButton, isRtl && styles.rowReverse]}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, isRtl && styles.iconWrapRtl]}>
                <Ionicons name={iconName} size={18} color={c.primary} />
              </View>
              <View style={[styles.textWrap, isRtl && styles.textRight]}>
                <Text style={[styles.label, isRtl && styles.textRight]} numberOfLines={1}>{item.label}</Text>
                <Text style={[styles.subtitle, isRtl && styles.textRight]} numberOfLines={1}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: c['muted-foreground'],
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    headerHint: {
      fontSize: 12,
      color: c['muted-foreground'],
      marginTop: 2,
    },
    list: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    stageButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      marginBottom: 6,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.border,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    iconWrapRtl: { marginRight: 0, marginLeft: 12 },
    rowReverse: { flexDirection: 'row-reverse' },
    textRight: { textAlign: 'right' },
    textWrap: {
      flex: 1,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: c.foreground,
    },
    subtitle: {
      fontSize: 12,
      color: c['muted-foreground'],
      marginTop: 1,
    },
  });
}

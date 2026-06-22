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
  UserCheck: "person-outline",
  ShieldCheck: "shield-checkmark-outline",
  Award: "trophy-outline",
};

const PREMIUM_STAGES = ["assessment_test", "coding_test", "background_check"];

export default function StageLibrary({ onRequestAddStage, isPremium }) {
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
          const isComingSoon = item.comingSoon;
          const isPremiumLocked = !isPremium && PREMIUM_STAGES.includes(item.key);
          const isLocked = isComingSoon || isPremiumLocked;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => !isLocked && onRequestAddStage(item)}
              style={[styles.stageButton, isRtl && styles.rowReverse, isLocked && styles.stageButtonLocked]}
              activeOpacity={isLocked ? 1 : 0.7}
              disabled={isLocked}
            >
              <View style={[styles.iconWrap, isRtl && styles.iconWrapRtl]}>
                <Ionicons
                  name={isComingSoon ? "time-outline" : isPremiumLocked ? "lock-closed-outline" : iconName}
                  size={18}
                  color={isLocked ? c.border : c.primary}
                />
              </View>
              <View style={[styles.textWrap, isRtl && styles.textRight]}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, isRtl && styles.textRight, isLocked && styles.labelLocked]} numberOfLines={1}>{item.label}</Text>
                  {isComingSoon && <Text style={styles.comingSoonBadge}>{t("pipeline.coming_soon")}</Text>}
                  {isPremiumLocked && <Text style={styles.premiumBadge}>{t("companies.premium_badge")}</Text>}
                </View>
                <Text style={[styles.subtitle, isRtl && styles.textRight, isLocked && styles.subtitleLocked]} numberOfLines={1}>{item.subtitle}</Text>
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
      fontWeight: '700',
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
      fontWeight: '600',
      color: c.foreground,
    },
    subtitle: {
      fontSize: 12,

      color: c['muted-foreground'],
      marginTop: 1,
    },
    stageButtonLocked: {
      opacity: 0.5,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    labelLocked: {
      color: c['muted-foreground'],
    },
    subtitleLocked: {
      color: c.border,
    },
    premiumBadge: {
      fontSize: 9,
      fontWeight: '600',
      color: c.emerald[600],
      backgroundColor: c.emerald[100],
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
      overflow: "hidden",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    comingSoonBadge: {
      fontSize: 9,
      fontWeight: '600',
      color: c.amber[600],
      backgroundColor: c.amber[100],
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
      overflow: "hidden",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
  });
}

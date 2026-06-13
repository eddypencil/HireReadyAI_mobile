import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../shared/context/ThemeContext";
import { FONT_FAMILY, FONT_FAMILY_MEDIUM, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD, FONT_FAMILY_EXTRABOLD } from '../../../../src/fonts';

function getLabel(score, c) {
  if (score >= 91)
    return {
      text: "Your profile is complete and recruiter-ready! 🎉",
      color: "#059669",
    };
  if (score >= 71)
    return {
      text: "Almost there! A few more fields will make you shine.",
      color: "#10b981",
    };
  if (score >= 41)
    return {
      text: "Good start! Add more details to stand out.",
      color: "#f97316",
    };
  return {
    text: "Your profile needs work — recruiters may skip incomplete profiles.",
    color: "#eab308",
  };
}
import { useTranslation } from "../../../../shared/context/I18nContext";

function getBarColor(score, c) {
  if (score >= 91) return "#059669";
  if (score >= 71) return "#10b981";
  if (score >= 41) return "#f97316";
  return "#eab308";
}

export function calcCompleteness(profile) {
  const fields = [
    { key: "profile_pic", weight: 10 },
    { key: "headline", weight: 10 },
    { key: "bio", weight: 15 },
    { key: "location", weight: 5 },
    { key: "phone", weight: 5 },
    { key: "linkedin_url", weight: 5 },
    { key: "experience", weight: 20 },
    { key: "education", weight: 15 },
    { key: "skills", weight: 10 },
    { key: "projects", weight: 5 },
  ];

  let score = 0;
  const missing = [];

  fields.forEach((f) => {
    const val = profile?.[f.key];
    const filled = Array.isArray(val) ? val.length > 0 : !!val;
    if (filled) score += f.weight;
    else missing.push(f.key);
  });

  return { score, missing };
}

export default function CompletenessBar({ score, missing, onFieldPress }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  let labelText = "";
  let labelColor = "";
  if (score >= 91) {
    labelText = t("profile.msg_complete");
    labelColor = c.success;
  } else if (score >= 71) {
    labelText = t("profile.msg_almost");
    labelColor = c.accent;
  } else if (score >= 41) {
    labelText = t("profile.msg_good");
    labelColor = c.warning;
  } else {
    labelText = t("profile.msg_incomplete");
    labelColor = c.destructive;
  }
  const barColor = getBarColor(score, c);
  let badgeText = "";
  if (score >= 91) badgeText = t("profile.complete_badge");
  else if (score >= 71) badgeText = t("profile.almost_badge");
  else if (score >= 41) badgeText = t("profile.in_progress_badge");
  else badgeText = t("profile.incomplete_badge");

  return (
    <View style={styles.card}>
      {/* Score row */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreLeft}>
          <Text style={styles.scoreNum}>{score}%</Text>
          <Text style={styles.scoreLabel}>{t("profile.profile_complete")}</Text>
        </View>
        <View
          style={[
            styles.scoreBadge,
            { backgroundColor: `${barColor}18`, borderColor: `${barColor}40` },
          ]}
        >
          <Text style={[styles.scoreBadgeText, { color: barColor }]}>
            {badgeText}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${score}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      {/* Message */}
      <Text style={[styles.message, { color: labelColor }]}>{labelText}</Text>

      {/* Missing fields */}
      {missing.length > 0 && (
        <View style={styles.missingSection}>
          <Text style={styles.missingTitle}>{t("profile.boost_profile")}</Text>
          <View style={styles.missingPills}>
            {missing.slice(0, 4).map((fieldKey, i) => (
              <TouchableOpacity
                key={i}
                style={styles.missingPill}
                onPress={() => onFieldPress?.(fieldKey)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={12}
                  color={c.accent}
                />
                <Text style={styles.missingPillText}>
                  {t(`profile.fields.${fieldKey}`)}
                </Text>
              </TouchableOpacity>
            ))}
            {missing.length > 4 && (
              <View style={styles.morePill}>
                <Text style={styles.morePillText}>
                  {t("profile.more_fields", { count: missing.length - 4 })}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 18,
      gap: 12,
    },
    scoreRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    scoreLeft: { gap: 1 },
    scoreNum: { fontSize: 26, color: c.foreground, fontFamily: FONT_FAMILY_EXTRABOLD },
    scoreLabel: {
      fontSize: 11,
      color: c["muted-foreground"],
      fontFamily: FONT_FAMILY_MEDIUM,
    },
    scoreBadge: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    scoreBadgeText: { fontSize: 11, fontFamily: FONT_FAMILY_BOLD },
    track: {
      height: 8,
      backgroundColor: c.surface,
      borderRadius: 4,
      overflow: "hidden",
    },
    fill: { height: "100%", borderRadius: 4 },
    message: { fontSize: 13, lineHeight: 19, fontFamily: FONT_FAMILY_MEDIUM },
    missingSection: { gap: 8 },
    missingTitle: {
      fontSize: 12,
      color: c["muted-foreground"],
      fontFamily: FONT_FAMILY_SEMIBOLD,
    },
    missingPills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    missingPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: `${c.accent}12`,
      borderWidth: 1,
      borderColor: `${c.accent}30`,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    missingPillText: { fontSize: 11, color: c.accent, fontFamily: FONT_FAMILY_SEMIBOLD },
    morePill: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    morePillText: { fontSize: 11, color: c["muted-foreground"], fontFamily: FONT_FAMILY },
  });
}

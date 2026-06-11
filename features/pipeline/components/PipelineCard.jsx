import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PipelineCard({ pipeline, onPress }) {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  const c = theme.colors;
  const styles = createStyles(c);

  const arrow = isRtl ? '←' : '→';

  const SENIORITY_COLORS = {
    intern: { bg: "#e0f2fe", text: "#075985" },
    junior: { bg: "#d1fae5", text: "#065f46" },
    mid: { bg: c.border, text: c.foreground },
    senior: { bg: c.border, text: c.foreground },
    lead: { bg: "#ffedd5", text: "#9a3412" },
  };

  const stages = pipeline.recruitment_stages || [];
  const stageCount = stages.length;
  const previewStages = stages.slice(0, 4);
  const overflow = stageCount - 4;

  const seniorityColor =
    SENIORITY_COLORS[pipeline.seniority_level] ||
    { bg: c.border, text: c['muted-foreground'] };

  return (
    <TouchableOpacity
      onPress={() => onPress(pipeline)}
      activeOpacity={0.8}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="git-network-outline" size={20} color={c.primary} />
        </View>
        {pipeline.seniority_level && (
          <View style={[styles.seniorityBadge, { backgroundColor: seniorityColor.bg }]}>
            <Text style={[styles.seniorityText, { color: seniorityColor.text }]}>
              {pipeline.seniority_level.charAt(0).toUpperCase() +
                pipeline.seniority_level.slice(1)}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {pipeline.title}
      </Text>
      <Text style={styles.date}>{t("pipeline.created", { date: formatDate(pipeline.created_at) })}</Text>

      {stageCount > 0 ? (
        <View style={styles.stagePreview}>
          {previewStages.map((stage, idx) => (
            <View key={stage.id} style={[styles.stageRow, isRtl && styles.rowReverse]}>
              <View style={styles.stageChip}>
                <Text style={styles.stageChipText} numberOfLines={1}>
                  {stage.name}
                </Text>
              </View>
              {(idx < previewStages.length - 1 || overflow > 0) && (
                <Text style={styles.stageArrow}>{arrow}</Text>
              )}
            </View>
          ))}
          {overflow > 0 && (
            <View style={styles.overflowBadge}>
              <Text style={styles.overflowText}>+{overflow}</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.noStages}>{t("pipeline.no_stages")}</Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {stageCount} {t(stageCount === 1 ? "pipeline.stage" : "pipeline.stages")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 20,
      marginBottom: 12,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.border,
      justifyContent: "center",
      alignItems: "center",
    },
    seniorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    seniorityText: {
      fontSize: 11,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: c.foreground,
      marginBottom: 4,
    },
    date: {
      fontSize: 12,
      color: c['muted-foreground'],
      marginBottom: 16,
    },
    stagePreview: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 4,
      marginBottom: 16,
    },
    stageRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    rowReverse: { flexDirection: 'row-reverse' },
    stageChip: {
      backgroundColor: c['surface-muted'],
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      maxWidth: 90,
    },
    stageChipText: {
      fontSize: 11,
      color: c['muted-foreground'],
    },
    stageArrow: {
      fontSize: 12,
      color: c.border,
    },
    overflowBadge: {
      backgroundColor: c['surface-muted'],
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    overflowText: {
      fontSize: 11,
      fontWeight: "600",
      color: c.primary,
    },
    noStages: {
      fontSize: 12,
      fontStyle: "italic",
      color: c['muted-foreground'],
      marginBottom: 16,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 12,
    },
    footerText: {
      fontSize: 12,
      fontWeight: "500",
      color: c['muted-foreground'],
    },
  });
}

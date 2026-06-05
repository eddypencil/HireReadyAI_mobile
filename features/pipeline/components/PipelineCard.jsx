import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";

const SENIORITY_COLORS = {
  intern: { bg: "#e0f2fe", text: "#075985" },
  junior: { bg: "#d1fae5", text: "#065f46" },
  mid: { bg: colors.darkAmethyst[100], text: colors.darkAmethyst[700] },
  senior: { bg: colors.mauveMagic[100], text: colors.mauveMagic[700] },
  lead: { bg: "#ffedd5", text: "#9a3412" },
};

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
  const stages = pipeline.recruitment_stages || [];
  const stageCount = stages.length;
  const previewStages = stages.slice(0, 4);
  const overflow = stageCount - 4;

  const seniorityColor =
    SENIORITY_COLORS[pipeline.seniority_level] ||
    { bg: colors.gray[100], text: colors.gray[600] };

  return (
    <TouchableOpacity
      onPress={() => onPress(pipeline)}
      activeOpacity={0.8}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="git-network-outline" size={20} color={colors.darkAmethyst[600]} />
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
      <Text style={styles.date}>Created {formatDate(pipeline.created_at)}</Text>

      {stageCount > 0 ? (
        <View style={styles.stagePreview}>
          {previewStages.map((stage, idx) => (
            <View key={stage.id} style={styles.stageRow}>
              <View style={styles.stageChip}>
                <Text style={styles.stageChipText} numberOfLines={1}>
                  {stage.name}
                </Text>
              </View>
              {(idx < previewStages.length - 1 || overflow > 0) && (
                <Text style={styles.stageArrow}>→</Text>
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
        <Text style={styles.noStages}>No stages yet</Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {stageCount} {stageCount === 1 ? "stage" : "stages"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.gray[100],
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
    backgroundColor: colors.darkAmethyst[100],
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
    color: colors.gray[900],
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.gray[400],
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
  stageChip: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: 90,
  },
  stageChipText: {
    fontSize: 11,
    color: colors.gray[600],
  },
  stageArrow: {
    fontSize: 12,
    color: colors.gray[300],
  },
  overflowBadge: {
    backgroundColor: colors.darkAmethyst[50],
    borderWidth: 1,
    borderColor: colors.darkAmethyst[200],
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  overflowText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.darkAmethyst[600],
  },
  noStages: {
    fontSize: 12,
    fontStyle: "italic",
    color: colors.gray[400],
    marginBottom: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[500],
  },
});

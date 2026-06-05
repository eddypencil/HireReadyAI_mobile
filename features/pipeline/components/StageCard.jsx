import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";

export default function StageCard({
  stage,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(stage)}
      activeOpacity={0.8}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
      ]}
    >
      <View style={styles.leftCol}>
        {stage.is_locked ? (
          <Ionicons name="lock-closed-outline" size={16} color={colors.gray[300]} />
        ) : (
          <>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); onMoveUp(stage.id); }}
              disabled={isFirst}
              style={styles.moveBtn}
            >
              <Ionicons
                name="chevron-up-outline"
                size={14}
                color={isFirst ? colors.gray[200] : colors.gray[400]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); onMoveDown(stage.id); }}
              disabled={isLast}
              style={styles.moveBtn}
            >
              <Ionicons
                name="chevron-down-outline"
                size={14}
                color={isLast ? colors.gray[200] : colors.gray[400]}
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.name, isSelected && styles.nameSelected]}
          numberOfLines={1}
        >
          {stage.name}
        </Text>
        <Text style={styles.type} numberOfLines={1}>
          {stage.stage_type?.replace(/_/g, " ")}
        </Text>
      </View>

      {stage.weight != null && (
        <View style={styles.weightBadge}>
          <Text style={styles.weightText}>
            {Math.round(stage.weight * 100)}% wt
          </Text>
        </View>
      )}

      {!stage.is_locked && (
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); onDelete(stage.id); }}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color={colors.gray[300]} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
  },
  cardSelected: {
    borderColor: colors.darkAmethyst[500],
    backgroundColor: colors.darkAmethyst[50] + "/60",
  },
  leftCol: {
    alignItems: "center",
    gap: 2,
    width: 20,
  },
  moveBtn: {
    padding: 2,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[900],
  },
  nameSelected: {
    color: colors.darkAmethyst[900],
  },
  type: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 2,
    textTransform: "capitalize",
  },
  weightBadge: {
    backgroundColor: colors.gray[100],
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  weightText: {
    fontSize: 11,
    color: colors.gray[500],
    fontWeight: "500",
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
  },
});

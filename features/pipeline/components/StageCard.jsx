import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

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
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  const c = theme.colors;
  const styles = createStyles(c);

  return (
    <TouchableOpacity
      onPress={() => onSelect(stage)}
      activeOpacity={0.8}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isRtl && styles.rowReverse,
      ]}
    >
      <View style={styles.leftCol}>
        {stage.is_locked ? (
          <Ionicons name="lock-closed-outline" size={16} color={c.border} />
        ) : (
          <>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); onMoveUp(stage.id, -1); }}
              disabled={isFirst}
              style={styles.moveBtn}
            >
              <Ionicons
                name="chevron-up-outline"
                size={14}
                color={isFirst ? c.border : c['muted-foreground']}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); onMoveDown(stage.id, 1); }}
              disabled={isLast}
              style={styles.moveBtn}
            >
              <Ionicons
                name="chevron-down-outline"
                size={14}
                color={isLast ? c.border : c['muted-foreground']}
              />
            </TouchableOpacity>
          </>
        )}
      </View>

        <View style={styles.info}>
        <Text
          style={[styles.name, isSelected && styles.nameSelected, isRtl && styles.textRight]}
          numberOfLines={1}
        >
          {stage.name}
        </Text>
        <Text style={[styles.type, isRtl && styles.textRight]} numberOfLines={1}>
          {stage.stage_type?.replace(/_/g, " ")}
        </Text>
      </View>

      {stage.weight != null && (
        <View style={styles.weightBadge}>
          <Text style={styles.weightText}>
            {t("pipeline.weight_label", { pct: Math.round(stage.weight * 100) })}
          </Text>
        </View>
      )}

      {!stage.is_locked && (
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); onDelete(stage.id); }}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color={c.border} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 14,
      paddingHorizontal: 12,
      gap: 10,
    },
    rowReverse: { flexDirection: 'row-reverse' },
    textRight: { textAlign: 'right' },
    cardSelected: {
      borderColor: c['muted-foreground'],
      backgroundColor: `${c['surface-muted']}99`,
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
      color: c.foreground,
    },
    nameSelected: {
      color: c.foreground,
    },
    type: {
      fontSize: 11,
      color: c['muted-foreground'],
      marginTop: 2,
      textTransform: "capitalize",
    },
    weightBadge: {
      backgroundColor: c.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    weightText: {
      fontSize: 11,
      color: c['muted-foreground'],
      fontWeight: "500",
    },
    deleteBtn: {
      padding: 6,
      borderRadius: 6,
    },
  });
}

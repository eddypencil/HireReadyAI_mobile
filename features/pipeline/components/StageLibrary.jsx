import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { STAGE_LIBRARY } from "../constants/stageLibrary";
import { colors } from "../../../src/theme";

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
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Stage Library</Text>
        <Text style={styles.headerHint}>Tap to append</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {STAGE_LIBRARY.map((item) => {
          const iconName = ICON_MAP[item.icon] || "document-text-outline";
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onAddStage(item)}
              style={styles.stageButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={iconName} size={18} color={colors.darkAmethyst[600]} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerHint: {
    fontSize: 12,
    color: colors.gray[500],
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
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[800],
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 1,
  },
});

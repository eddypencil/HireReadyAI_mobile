import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useUser } from "../../auth/context/user.context";

export default function PendingApprovalPage({ companyName }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { signOutUser } = useUser();
  const styles = createStyles(c);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <View style={styles.logoWrap}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>H</Text>
          </View>
          <Text style={styles.wordmark}>HireReadyAI</Text>
        </View>
        <TouchableOpacity onPress={signOutUser} style={styles.signOutBtn}>
          <Ionicons name="log-out" size={16} color={c['muted-foreground']} />
          <Text style={styles.signOutText}>{t("companies.sign_out")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="time-outline" size={40} color={c.warning} />
        </View>
        <Text style={styles.title}>{t("pending_approval.title")}</Text>
        <Text style={styles.subtitle}>
          {t("pending_approval.subtitle", { company: companyName || t("pending_approval.the_company") })}
        </Text>
        <Text style={styles.hint}>{t("pending_approval.contact_hr")}</Text>
      </View>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c['surface-muted'],
    },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 8,
      backgroundColor: c.sidebar,
    },
    logoWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    logoMark: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 16,
      fontWeight: "700",
      color: c['destructive-foreground'],
    },
    wordmark: {
      fontSize: 17,
      fontWeight: "600",
      color: c['sidebar-foreground'],
    },
    signOutBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: c.border,
    },
    signOutText: {
      fontSize: 12,
      color: c['muted-foreground'],
    },
    body: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: `${c.warning}20`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: c.foreground,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: c['muted-foreground'],
      textAlign: "center",
      marginBottom: 4,
    },
    hint: {
      fontSize: 12,
      color: c['muted-foreground'],
      opacity: 0.7,
      textAlign: "center",
    },
  });
}

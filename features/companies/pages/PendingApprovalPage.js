import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useUser } from "../../auth/context/user.context";
import { removeCompanyMember } from "../../../features/admin/services/admin.service";
import { signOut } from "../../../features/auth/services/auth.service";

export default function PendingApprovalPage({ companyName, companyId }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const { profile } = useUser();
  const navigation = useNavigation();
  const styles = createStyles(c);
  const [dismissing, setDismissing] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
    } catch {}
  }

  async function handleDismiss() {
    if (!profile?.id || !companyId) return;
    setDismissing(true);
    try {
      await removeCompanyMember(profile.id, companyId);
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch (err) {
      console.warn("Dismiss failed:", err);
    } finally {
      setDismissing(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoWrap}>
            <Ionicons name="time-outline" size={18} color={c.white} />
          </View>
          <Text style={styles.logoText}>HireReadyAI</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Ionicons name="time-outline" size={36} color={c.warning} />
        </View>
        <Text style={styles.title}>{t("pending_approval.title")}</Text>
        <Text style={styles.subtitle}>
          {t("pending_approval.subtitle", {
            company: companyName || t("pending_approval.company_fallback"),
          })}
        </Text>
        <Text style={styles.hint}>{t("pending_approval.contact_hr")}</Text>
        <View style={{ flexDirection: "column", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={16}
              color={c["destructive-foreground"]}
            />
            <Text style={styles.backBtnText}>
              {t("pending_approval.back_to_home")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDismiss}
            disabled={dismissing}
            style={styles.dismissBtn}
            activeOpacity={0.8}
          >
            {dismissing ? (
              <ActivityIndicator size="small" color={c.destructive} />
            ) : (
              <Ionicons name="close-circle-outline" size={16} color={c.destructive} />
            )}
            <Text style={styles.dismissBtnText}>
              Dismiss Request
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    logoWrap: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 18,
      fontWeight: "700",
      color: c.foreground,
    },
    signOutBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background,
    },
    signOutText: {
      fontSize: 12,
      fontWeight: "500",
      color: c["muted-foreground"],
    },
    body: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: `${c.warning}1a`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: c.foreground,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: c["muted-foreground"],
      textAlign: "center",
      marginBottom: 4,
    },
    hint: {
      fontSize: 12,
      color: c["muted-foreground"],
      opacity: 0.7,
      textAlign: "center",
      marginBottom: 28,
    },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: c.primary,
      borderRadius: 10,
    },
    backBtnText: {
      color: c["destructive-foreground"],
      fontSize: 13,
      fontWeight: "600",
    },
    dismissBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: `${c.destructive}12`,
      borderRadius: 10,
    },
    dismissBtnText: {
      color: c.destructive,
      fontSize: 13,
      fontWeight: "600",
    },
  });
}

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { FONT_FAMILY, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from '../../../src/fonts';

export default function JDPublishSuccessPage({ route, navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const { title } = route.params || {};

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={64} color={c.success} />
        </View>
        <Text style={styles.title}>{t("companies.job_published_title")}</Text>
        <Text style={styles.subtitle}>
          {t("companies.job_published_subtitle", { title })}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("JobPostings")}
            activeOpacity={0.85}
          >
            <Ionicons name="briefcase-outline" size={18} color={c.white} />
            <Text style={styles.primaryBtnText}>{t("companies.view_job_postings")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.75}
          >
            <Ionicons name="home-outline" size={18} color={c.primary} />
            <Text style={styles.secondaryBtnText}>{t("companies.back_to_dashboard")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c['surface-muted'],
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    content: {
      alignItems: "center",
      gap: 16,
      maxWidth: 320,
    },
    iconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: `${c.success}15`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    title: {
      fontSize: 22,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.foreground,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILY,
      color: c['muted-foreground'],
      textAlign: "center",
      lineHeight: 20,
    },
    jobTitle: {
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c.foreground,
    },
    actions: {
      width: "100%",
      gap: 12,
      marginTop: 16,
    },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingVertical: 14,
    },
    primaryBtnText: {
      color: c.white,
      fontSize: 15,
      fontFamily: FONT_FAMILY_SEMIBOLD,
    },
    secondaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: c.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 14,
    },
    secondaryBtnText: {
      color: c.primary,
      fontSize: 15,
      fontFamily: FONT_FAMILY_SEMIBOLD,
    },
  });
}

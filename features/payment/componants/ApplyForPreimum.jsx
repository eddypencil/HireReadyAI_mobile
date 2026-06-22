import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Crown } from "lucide-react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

export default function PlanBillingCard({
  company,
  upgrading,
  handleUpgrade,
}){
  const { theme } = useTheme();
  const c = theme.colors;
  const { t, language } = useTranslation();
  const isRTL = language === "ar";
  const styles = createStyles(c);

  return (
    <View style={styles.card}>
      <View style={[styles.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={styles.content}>
          <Text style={styles.title}>{t("companies.plan_billing")}</Text>

          <Text style={[styles.description, { textAlign: isRTL ? "right" : "left" }]}>
            {company?.is_premium
              ? t("companies.premium_active")
              : t("companies.upgrade_description")}
          </Text>

          {!company?.is_premium && (
            <View style={styles.features}>
              <Text style={[styles.feature, { textAlign: isRTL ? "right" : "left" }]}>• {t("companies.feature_assessment")}</Text>
              <Text style={[styles.feature, { textAlign: isRTL ? "right" : "left" }]}>• {t("companies.feature_coding")}</Text>
            </View>
          )}
        </View>

        <View>
          {company?.is_premium ? (
            <View style={[styles.premiumBadge, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Crown size={14} color={c.emerald[700]} />
              <Text style={styles.premiumText}>{t("companies.premium_badge")}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                { flexDirection: isRTL ? "row-reverse" : "row" },
                styles.upgradeButton,
                upgrading && styles.upgradeButtonDisabled,
              ]}
              onPress={handleUpgrade}
              disabled={upgrading}
            >
              <Crown size={16} color={c.white} />
              <Text style={styles.upgradeText}>
                {upgrading ? t("companies.redirecting") : t("companies.upgrade_button")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 20,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: c.foreground,
      marginBottom: 2,
    },
    description: {
      fontSize: 11,
      
      color: c['muted-foreground'],
      lineHeight: 18,
    },
    features: {
      marginTop: 10,
      gap: 4,
    },
    feature: {
      fontSize: 12,
      
      color: c['muted-foreground'],
    },
    premiumBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: c.emerald[100],
      borderWidth: 1,
      borderColor: c.emerald[200],
    },
    premiumText: {
      color: c.emerald[700],
      fontSize: 12,
      fontWeight: '600',
    },
    upgradeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    upgradeButtonDisabled: {
      opacity: 0.5,
    },
    upgradeText: {
      color: c.white,
      fontSize: 12,
      fontWeight: '600',
    },
  });
}

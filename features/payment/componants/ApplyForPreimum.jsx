
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Crown } from "lucide-react-native";

export default function PlanBillingCard({
  company,
  upgrading,
  handleUpgrade,
}){

 

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.title}>Plan & Billing</Text>

          <Text style={styles.description}>
            {company?.is_premium
              ? "Your company is on the Premium plan."
              : "Upgrade to unlock premium stage types in your pipeline."}
          </Text>

          {!company?.is_premium && (
            <View style={styles.features}>
              <Text style={styles.feature}>• Assessment tests</Text>
              <Text style={styles.feature}>• Coding tests</Text>
              <Text style={styles.feature}>• Video interviews</Text>
              <Text style={styles.feature}>• Background checks</Text>
            </View>
          )}
        </View>

        <View>
          {company?.is_premium ? (
            <View style={styles.premiumBadge}>
              <Crown size={14} color="#16a34a" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                upgrading && styles.upgradeButtonDisabled,
              ]}
              onPress={handleUpgrade}
              disabled={upgrading}
            >
              <Crown size={16} color="#fff" />
              <Text style={styles.upgradeText}>
                {upgrading ? "Redirecting..." : "Upgrade - $29"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  description: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
  },

  features: {
    marginTop: 10,
    gap: 4,
  },

  feature: {
    fontSize: 12,
    color: "#9ca3af",
  },

  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  premiumText: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: "700",
  },

  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  upgradeButtonDisabled: {
    opacity: 0.5,
  },

  upgradeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

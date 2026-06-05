import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDashboardData } from "../hooks/useDashboardData";
import { useCompany } from "../../companies/pages/CompanyLayout";
import { useNavigation } from "@react-navigation/native";


const T = {
  primary: "#01497c",
  sidebar: "#012a4a",
  accent: "#468faf",
  surface: "#eef7fa",
  border: "#cfe7f2",
  foreground: "#012a4a",
  muted: "#2a6f97",
  white: "#ffffff",
};

const QUICK_ACTIONS = [
  { label: "Post Job", icon: "add-circle-outline", color: T.primary, screen: "JDGenerator" },
  { label: "View Pipeline", icon: "funnel-outline", color: T.accent, screen: "Pipeline" },
  { label: "Review Shortlists", icon: "document-text-outline", color: T.muted, screen: "Shortlists" },
];

export default function RecruiterScreen() {
  const { stats, isLoading, error } = useDashboardData();
  const { company } = useCompany();

  const navigation = useNavigation();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load dashboard</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerAccent} />
          <View style={styles.headerCardContent}>
            <Text style={styles.companyName}>{company?.name || "Dashboard"}</Text>
            <View style={styles.headerRow}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="business" size={24} color={T.primary} />
              </View>
              <View>
                <Text style={styles.welcomeText}>Welcome back</Text>
                <Text style={styles.roleText}>Recruiter Dashboard</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.kpiRow}>
          {[
            {
              label: "Total Jobs",
              value: stats.totalJobs,
              icon: "briefcase-outline",
            },
            {
              label: "Candidates",
              value: stats.totalApplicants,
              icon: "people-outline",
            },
            {
              label: "Accepted",
              value: stats.totalAccepted,
              icon: "calendar-outline",
            },
            {
              label: "Rejected",
              value: stats.totalRejected,
              icon: "gift-outline",
            },
          ].map((kpi, i) => (
            <View key={i} style={styles.kpiCard}>
              <Ionicons name={kpi.icon} size={18} color={T.primary} />
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: action.color + "18" },
                ]}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.surface,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#ef4444",
  },
  headerCard: {
    flexDirection: "row",
    backgroundColor: T.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    marginBottom: 24,
    overflow: "hidden",
  },
  headerAccent: {
    width: 5,
    backgroundColor: T.primary,
  },
  headerCardContent: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  welcomeText: {
    fontSize: 16,
    color: T.accent,
    marginBottom: 2,
  },
  companyName: {
    fontSize: 30,
    fontWeight: "800",
    color: T.foreground,
  },
  roleText: {
    fontSize: 15,
    color: T.muted,
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: T.foreground,
    marginBottom: 14,
  },
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  kpiCard: {
    width: "47%",
    backgroundColor: T.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: "800",
    color: T.foreground,
    marginTop: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: T.white,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: T.foreground,
    textAlign: "center",
  },
});

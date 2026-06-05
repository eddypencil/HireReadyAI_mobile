import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDashboardData } from "../hooks/useDashboardData";
import { useCompany } from "../../companies/pages/CompanyLayout";
import { useNavigation } from "@react-navigation/native";
import { Card } from "../../../shared/ui/Card";
import { colors } from "../../../src/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const KPI_GAP = 10;
const KPI_CARD_WIDTH = (SCREEN_WIDTH - 40 - KPI_GAP) / 2;

const QUICK_ACTIONS = [
  { label: "Post Job", icon: "add-circle-outline", screen: "JDGenerator" },
  { label: "View Pipeline", icon: "funnel-outline", screen: "Pipeline" },
  { label: "Review Shortlists", icon: "document-text-outline", screen: "Shortlists" },
];

function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return {
    isDark,
    background: isDark ? "#0b1120" : colors.surface,
    surface: isDark ? "#152032" : colors.white,
    card: isDark ? "#152032" : colors.white,
    border: isDark ? "#1e3048" : colors.border,
    foreground: isDark ? "#e2e8f0" : colors.foreground,
    muted: isDark ? "#8899b4" : colors.mutedForeground,
    primary: colors.primary,
    accent: colors.accent,
    primaryLight: isDark ? "#1a3a5c" : colors.primary + "18",
    success: colors.emerald[500],
    danger: colors.red[500],
    warning: colors.amber[500],
  };
}

function LoadingSkeleton({ theme }) {
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.skeletonHeader}>
        <View style={[styles.skeletonBlock, { backgroundColor: theme.border, width: "60%", height: 20 }]} />
        <View style={[styles.skeletonBlock, { backgroundColor: theme.border, width: "40%", height: 14, marginTop: 8 }]} />
      </View>
      <View style={styles.kpiRow}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.skeletonCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.skeletonBlock, { backgroundColor: theme.border, width: 32, height: 32, borderRadius: 16 }]} />
            <View style={[styles.skeletonBlock, { backgroundColor: theme.border, width: "50%", height: 28, marginTop: 8 }]} />
            <View style={[styles.skeletonBlock, { backgroundColor: theme.border, width: "70%", height: 12, marginTop: 4 }]} />
          </View>
        ))}
      </View>
      {[1, 2].map((i) => (
        <View
          key={i}
          style={[styles.skeletonSection, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.skeletonBlock, { backgroundColor: theme.border, width: "40%", height: 16 }]} />
          <View style={[styles.skeletonBlock, { backgroundColor: theme.border, width: "100%", height: 60, marginTop: 12 }]} />
        </View>
      ))}
    </View>
  );
}

function KpiCard({ icon, value, label, color, theme, accessibilityLabel }) {
  return (
    <View
      style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[styles.kpiIconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.kpiValue, { color: theme.foreground }]}>{value}</Text>
      <Text style={[styles.kpiLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

function PipelineBar({ label, count, maxCount, color, theme }) {
  const pct = maxCount > 0 ? count / maxCount : 0;
  return (
    <View style={styles.pipelineItem}>
      <View style={styles.pipelineLabelRow}>
        <Text style={[styles.pipelineLabel, { color: theme.foreground }]}>{label}</Text>
        <Text style={[styles.pipelineCount, { color: theme.primary }]}>{count}</Text>
      </View>
      <View style={[styles.pipelineTrack, { backgroundColor: theme.border }]}>
        <View
          style={[styles.pipelineFill, { width: `${Math.max(pct * 100, 2)}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

function TrendBar({ day, count, maxCount, theme }) {
  const barHeight = maxCount > 0 ? Math.max((count / maxCount) * 100, 4) : 4;
  return (
    <View style={styles.trendColumn}>
      <View style={styles.trendBarWrap}>
        <View
          style={[
            styles.trendBar,
            { height: barHeight, backgroundColor: theme.primary },
          ]}
        />
      </View>
      <Text style={[styles.trendDay, { color: theme.muted }]}>{day}</Text>
      <Text style={[styles.trendCount, { color: theme.foreground }]}>{count}</Text>
    </View>
  );
}

function TopJobRow({ rank, name, count, maxCount, theme }) {
  const pct = maxCount > 0 ? count / maxCount : 0;
  return (
    <View style={styles.topJobRow}>
      <View style={[styles.topJobRank, { backgroundColor: theme.primaryLight }]}>
        <Text style={[styles.topJobRankText, { color: theme.primary }]}>{rank}</Text>
      </View>
      <View style={styles.topJobInfo}>
        <Text style={[styles.topJobName, { color: theme.foreground }]} numberOfLines={1}>
          {name}
        </Text>
        <View style={[styles.topJobTrack, { backgroundColor: theme.border }]}>
          <View
            style={[styles.topJobFill, { width: `${Math.max(pct * 100, 2)}%`, backgroundColor: theme.accent }]}
          />
        </View>
      </View>
      <Text style={[styles.topJobCount, { color: theme.muted }]}>{count}</Text>
    </View>
  );
}

export default function RecruiterScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation();
  const { company } = useCompany();
  const { stats, pipelineSummaryData, trendData, topJobsData, isLoading, error } =
    useDashboardData();

  if (isLoading) {
    return <LoadingSkeleton theme={theme} />;
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <View style={[styles.errorCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.errorIconWrap, { backgroundColor: theme.danger + "18" }]}>
            <Ionicons name="alert-circle-outline" size={40} color={theme.danger} />
          </View>
          <Text style={[styles.errorTitle, { color: theme.foreground }]}>Something went wrong</Text>
          <Text style={[styles.errorDesc, { color: theme.muted }]}>Failed to load dashboard data</Text>
        </View>
      </View>
    );
  }

  const metrics = [
    {
      icon: "briefcase-outline",
      value: stats.totalJobs,
      label: "Total Jobs",
      color: theme.primary,
      a11y: `${stats.totalJobs} total jobs`,
    },
    {
      icon: "people-outline",
      value: stats.totalApplicants,
      label: "Candidates",
      color: theme.accent,
      a11y: `${stats.totalApplicants} candidates`,
    },
    {
      icon: "checkmark-circle-outline",
      value: stats.totalAccepted,
      label: "Accepted",
      color: theme.success,
      a11y: `${stats.totalAccepted} accepted`,
    },
    {
      icon: "close-circle-outline",
      value: stats.totalRejected,
      label: "Rejected",
      color: theme.danger,
      a11y: `${stats.totalRejected} rejected`,
    },
  ];

  const pipelineStages = pipelineSummaryData
    ? [
        { label: "Applied", count: pipelineSummaryData.applied, color: "#89c2d9" },
        { label: "Screened", count: pipelineSummaryData.screened, color: "#61a5c2" },
        { label: "Interviewed", count: pipelineSummaryData.interviewed, color: "#2c7da0" },
        { label: "Shortlisted", count: pipelineSummaryData.shortlisted, color: "#01497c" },
      ]
    : [];

  const maxPipelineCount = Math.max(...pipelineStages.map((s) => s.count), 1);

  const maxTrendCount = Math.max(...trendData.map((d) => d.applications), 1);
  const maxTopJobCount = Math.max(...topJobsData.map((j) => j.applicants), 1);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          accessibilityRole="header"
        >
          <View style={[styles.headerAccent, { backgroundColor: theme.primary }]} />
          <View style={styles.headerCardContent}>
            <Text
              style={[styles.companyName, { color: theme.foreground }]}
              accessibilityRole="text"
            >
              {company?.name || "Dashboard"}
            </Text>
            <View style={styles.headerRow}>
              <View style={[styles.headerIconCircle, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="business" size={22} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.welcomeText, { color: theme.muted }]}>Welcome back</Text>
                <Text style={[styles.roleText, { color: theme.foreground }]}>
                  Recruiter Dashboard
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Key Metrics</Text>
        <View
          style={styles.kpiRow}
          accessibilityRole="summary"
          accessibilityLabel={`Key metrics: ${metrics.map((m) => `${m.label} ${m.value}`).join(", ")}`}
        >
          {metrics.map((kpi, i) => (
            <KpiCard key={i} {...kpi} theme={theme} />
          ))}
        </View>

        {/* Pipeline Summary
        {pipelineStages.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Pipeline Summary</Text>
            <Card
              style={[styles.contentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View
                style={styles.pipelineBody}
                accessibilityRole="summary"
                accessibilityLabel={`Pipeline: ${pipelineStages.map((s) => `${s.label} ${s.count}`).join(", ")}`}
              >
                {pipelineStages.map((stage, i) => (
                  <PipelineBar
                    key={i}
                    label={stage.label}
                    count={stage.count}
                    maxCount={maxPipelineCount}
                    color={stage.color}
                    theme={theme}
                  />
                ))}
              </View>
            </Card>
          </>
        )} */}

        {/* Application Trend */}
        {trendData.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
              Applications (7 Days)
            </Text>
            <Card
              style={[styles.contentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View
                style={styles.trendBody}
                accessibilityRole="summary"
                accessibilityLabel={`Applications over last 7 days: ${trendData.map((d) => `${d.day} ${d.applications}`).join(", ")}`}
              >
                {trendData.map((item, i) => (
                  <TrendBar
                    key={i}
                    day={item.day}
                    count={item.applications}
                    maxCount={maxTrendCount}
                    theme={theme}
                  />
                ))}
              </View>
            </Card>
          </>
        )}

        {/* Top Jobs */}
        {topJobsData.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Top Jobs</Text>
            <Card
              style={[styles.contentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View
                style={styles.topJobsBody}
                accessibilityRole="summary"
                accessibilityLabel={`Top jobs by applicants: ${topJobsData.map((j) => `${j.name} ${j.applicants}`).join(", ")}`}
              >
                {topJobsData.map((job, i) => (
                  <TopJobRow
                    key={i}
                    rank={i + 1}
                    name={job.name}
                    count={job.applicants}
                    maxCount={maxTopJobCount}
                    theme={theme}
                  />
                ))}
              </View>
            </Card>
          </>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.quickActionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityHint={`Navigates to ${action.label} screen`}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name={action.icon} size={24} color={theme.primary} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.foreground }]}>
                {action.label}
              </Text>
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
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    marginTop: 4,
  },

  /* Skeleton */
  skeletonHeader: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 20,
  },
  skeletonCard: {
    width: KPI_CARD_WIDTH,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  skeletonSection: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  skeletonBlock: {
    borderRadius: 6,
  },

  /* Error */
  errorCard: {
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  errorIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  errorDesc: {
    fontSize: 14,
    marginBottom: 20,
  },
  /* Header */
  headerCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
  },
  headerAccent: {
    width: 5,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 2,
  },
  companyName: {
    fontSize: 28,
    fontWeight: "800",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  /* KPI */
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: KPI_GAP,
    marginBottom: 28,
  },
  kpiCard: {
    width: KPI_CARD_WIDTH,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: "800",
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  /* Pipeline */
  contentCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    padding: 0,
  },
  pipelineBody: {
    padding: 18,
    gap: 12,
  },
  pipelineItem: {
    gap: 6,
  },
  pipelineLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pipelineLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  pipelineCount: {
    fontSize: 14,
    fontWeight: "700",
  },
  pipelineTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  pipelineFill: {
    height: "100%",
    borderRadius: 4,
  },

  /* Trend */
  trendBody: {
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 160,
  },
  trendColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  trendBarWrap: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  trendBar: {
    width: 24,
    borderRadius: 6,
    minHeight: 4,
  },
  trendDay: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 6,
  },
  trendCount: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  /* Top Jobs */
  topJobsBody: {
    padding: 18,
    gap: 16,
  },
  topJobRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topJobRank: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  topJobRankText: {
    fontSize: 12,
    fontWeight: "700",
  },
  topJobInfo: {
    flex: 1,
    gap: 6,
  },
  topJobName: {
    fontSize: 13,
    fontWeight: "600",
  },
  topJobTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  topJobFill: {
    height: "100%",
    borderRadius: 3,
  },
  topJobCount: {
    fontSize: 14,
    fontWeight: "700",
    minWidth: 28,
    textAlign: "right",
  },

  /* Quick Actions */
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
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
    textAlign: "center",
  },
});

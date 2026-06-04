import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const T = {
  primary: '#01497c',
  sidebar: '#012a4a',
  accent: '#468faf',
  surface: '#eef7fa',
  border: '#cfe7f2',
  foreground: '#012a4a',
  muted: '#2a6f97',
  white: '#ffffff',
};

const KPI_DATA = {
  activeJobs: 12,
  totalCandidates: 348,
  interviewsThisWeek: 28,
  offers: 5,
};

const RECENT_ACTIVITY = [
  { id: '1', text: 'Sarah Chen applied for Senior Frontend', time: '2m ago', icon: 'person-add-outline' },
  { id: '2', text: 'Interview scheduled with Mark Rivera', time: '15m ago', icon: 'calendar-outline' },
  { id: '3', text: 'New job posting "DevOps Engineer" published', time: '1h ago', icon: 'briefcase-outline' },
  { id: '4', text: 'Offer accepted by Jessica Park', time: '3h ago', icon: 'checkmark-circle-outline' },
  { id: '5', text: 'Shortlist reviewed for Backend Lead', time: '5h ago', icon: 'list-outline' },
];

const QUICK_ACTIONS = [
  { label: 'Post Job', icon: 'add-circle-outline', color: T.primary },
  { label: 'View Pipeline', icon: 'funnel-outline', color: T.accent },
  { label: 'Review Shortlists', icon: 'document-text-outline', color: T.muted },
];

export default function RecruiterScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <Ionicons name="business" size={28} color={T.white} style={styles.headerIcon} />
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.companyName}>HireReadyAI</Text>
          <Text style={styles.roleText}>Recruiter Dashboard</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.kpiRow}>
          {[
            { label: 'Active Jobs', value: KPI_DATA.activeJobs, icon: 'briefcase-outline' },
            { label: 'Candidates', value: KPI_DATA.totalCandidates, icon: 'people-outline' },
            { label: 'Interviews', value: KPI_DATA.interviewsThisWeek, icon: 'calendar-outline' },
            { label: 'Offers', value: KPI_DATA.offers, icon: 'gift-outline' },
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
            <TouchableOpacity key={i} style={styles.quickActionCard} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '18' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activitySection}>
          {RECENT_ACTIVITY.map((item) => (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityIconWrap}>
                <Ionicons name={item.icon} size={16} color={T.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{item.text}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
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
  header: {
    backgroundColor: T.sidebar,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerGradient: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 14,
    color: T.accent,
    marginBottom: 2,
  },
  companyName: {
    fontSize: 26,
    fontWeight: '800',
    color: T.white,
  },
  roleText: {
    fontSize: 13,
    color: T.muted,
    marginTop: 4,
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
    fontWeight: '700',
    color: T.foreground,
    marginBottom: 14,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  kpiCard: {
    width: '47%',
    backgroundColor: T.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '800',
    color: T.foreground,
    marginTop: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: T.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: T.foreground,
    textAlign: 'center',
  },
  activitySection: {
    backgroundColor: T.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    padding: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  activityIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: T.foreground,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
});

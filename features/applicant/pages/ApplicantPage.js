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

const STAGE_COLORS = {
  applied: { bg: '#eef7fa', text: '#01497c' },
  screening: { bg: '#fff3cd', text: '#856404' },
  interview: { bg: '#d1ecf1', text: '#0c5460' },
  hired: { bg: '#d4edda', text: '#155724' },
  rejected: { bg: '#f8d7da', text: '#721c24' },
};

const MOCK_APPLICATIONS = [
  {
    id: '1',
    jobTitle: 'Frontend Developer',
    company: 'TechCorp Inc.',
    stage: 'applied',
    dateApplied: '2025-05-20',
    avatar: 'TC',
  },
  {
    id: '2',
    jobTitle: 'React Native Engineer',
    company: 'StartupX',
    stage: 'interview',
    dateApplied: '2025-05-15',
    avatar: 'SX',
  },
  {
    id: '3',
    jobTitle: 'Full Stack Developer',
    company: 'Digital Solutions',
    stage: 'screening',
    dateApplied: '2025-05-10',
    avatar: 'DS',
  },
  {
    id: '4',
    jobTitle: 'Mobile Lead',
    company: 'AppWorks',
    stage: 'hired',
    dateApplied: '2025-04-28',
    avatar: 'AW',
  },
];

function getStagePill(stage) {
  const config = STAGE_COLORS[stage] || { bg: '#eef7fa', text: T.foreground };
  return { backgroundColor: config.bg, color: config.text };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ApplicantPage() {
  const applications = MOCK_APPLICATIONS;
  const stats = [
    { label: 'Total Applications', value: applications.length, icon: 'document-text-outline' },
    { label: 'Interviews', value: applications.filter(a => a.stage === 'interview').length, icon: 'calendar-outline' },
    { label: 'Offers', value: applications.filter(a => a.stage === 'hired').length, icon: 'briefcase-outline' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <Ionicons name="briefcase" size={28} color={T.white} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>My Applications</Text>
          <Text style={styles.headerSubtitle}>Track your job applications</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={s.icon} size={20} color={T.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Timeline</Text>

        {applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color={T.border} />
            <Text style={styles.emptyText}>No applications yet</Text>
            <Text style={styles.emptySubtext}>Start applying to jobs to see them here</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {applications.map((app, index) => {
              const pill = getStagePill(app.stage);
              return (
                <View key={app.id} style={styles.timelineItem}>
                  {index < applications.length - 1 && <View style={styles.timelineLine} />}
                  <View style={styles.timelineDot} />
                  <TouchableOpacity style={styles.appCard} activeOpacity={0.7}>
                    <View style={styles.cardRow}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{app.avatar}</Text>
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.jobTitle}>{app.jobTitle}</Text>
                        <Text style={styles.companyName}>{app.company}</Text>
                        <View style={styles.cardMeta}>
                          <View style={[styles.statusPill, { backgroundColor: pill.bg }]}>
                            <Text style={[styles.statusText, { color: pill.color }]}>
                              {app.stage.charAt(0).toUpperCase() + app.stage.slice(1)}
                            </Text>
                          </View>
                          <Text style={styles.dateText}>{formatDate(app.dateApplied)}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={T.muted} />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
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
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: T.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: T.accent,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: T.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: T.foreground,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: T.foreground,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: T.muted,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: T.muted,
    marginTop: 4,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    marginBottom: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 32,
    bottom: -12,
    width: 2,
    backgroundColor: T.border,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: T.primary,
    marginTop: 18,
    marginRight: 14,
    borderWidth: 2,
    borderColor: T.white,
  },
  appCard: {
    flex: 1,
    backgroundColor: T.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: T.border,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: T.white,
    fontSize: 14,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: T.foreground,
  },
  companyName: {
    fontSize: 13,
    color: T.muted,
    marginTop: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    color: T.muted,
  },
});

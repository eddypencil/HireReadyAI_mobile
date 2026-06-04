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

const STAGES = [
  { key: 'applied', label: 'Applied', color: '#6b7280' },
  { key: 'screening', label: 'Screening', color: '#f59e0b' },
  { key: 'interview', label: 'Interview', color: '#3b82f6' },
  { key: 'assessment', label: 'Assessment', color: '#8b5cf6' },
  { key: 'final', label: 'Final', color: '#ec4899' },
  { key: 'hired', label: 'Hired', color: '#10b981' },
];

const DUMMY_CANDIDATES = {
  applied: [
    { id: '1', name: 'Alice Johnson', role: 'Frontend Developer', score: 92, initials: 'AJ' },
    { id: '2', name: 'Bob Smith', role: 'Backend Engineer', score: 78, initials: 'BS' },
    { id: '3', name: 'Carol Lee', role: 'UX Designer', score: 85, initials: 'CL' },
  ],
  screening: [
    { id: '4', name: 'David Kim', role: 'DevOps Engineer', score: 88, initials: 'DK' },
    { id: '5', name: 'Eva Martinez', role: 'Data Scientist', score: 72, initials: 'EM' },
  ],
  interview: [
    { id: '6', name: 'Frank Wilson', role: 'Product Manager', score: 91, initials: 'FW' },
  ],
  assessment: [
    { id: '7', name: 'Grace Chen', role: 'Full Stack Dev', score: 95, initials: 'GC' },
    { id: '8', name: 'Henry Brown', role: 'Mobile Engineer', score: 69, initials: 'HB' },
    { id: '9', name: 'Iris Davis', role: 'QA Engineer', score: 81, initials: 'ID' },
  ],
  final: [
    { id: '10', name: 'Jack Taylor', role: 'Engineering Lead', score: 96, initials: 'JT' },
  ],
  hired: [
    { id: '11', name: 'Karen White', role: 'Design Lead', score: 98, initials: 'KW' },
  ],
};

function getScoreColor(score) {
  if (score >= 90) return { bg: '#d4edda', text: '#155724' };
  if (score >= 75) return { bg: '#d1ecf1', text: '#0c5460' };
  if (score >= 60) return { bg: '#fff3cd', text: '#856404' };
  return { bg: '#f8d7da', text: '#721c24' };
}

export default function PipelineCandidatesPage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <Ionicons name="git-network-outline" size={28} color={T.white} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Candidate Pipeline</Text>
          <Text style={styles.headerSubtitle}>Drag and drop to move candidates</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardScroll}>
        <View style={styles.board}>
          {STAGES.map((stage) => {
            const candidates = DUMMY_CANDIDATES[stage.key] || [];
            return (
              <View key={stage.key} style={styles.column}>
                <View style={styles.columnHeader}>
                  <View style={[styles.stageDot, { backgroundColor: stage.color }]} />
                  <Text style={styles.columnTitle}>{stage.label}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{candidates.length}</Text>
                  </View>
                </View>

                <ScrollView style={styles.columnBody} showsVerticalScrollIndicator={false}>
                  {candidates.length === 0 ? (
                    <View style={styles.emptyColumn}>
                      <Ionicons name="move-outline" size={24} color={T.border} />
                      <Text style={styles.emptyColumnText}>Drop here</Text>
                    </View>
                  ) : (
                    candidates.map((candidate) => {
                      const sc = getScoreColor(candidate.score);
                      return (
                        <TouchableOpacity key={candidate.id} style={styles.candidateCard} activeOpacity={0.8}>
                          <View style={styles.candidateTop}>
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>{candidate.initials}</Text>
                            </View>
                            <View style={styles.candidateInfo}>
                              <Text style={styles.candidateName}>{candidate.name}</Text>
                              <Text style={styles.candidateRole}>{candidate.role}</Text>
                            </View>
                          </View>
                          <View style={[styles.scoreBadge, { backgroundColor: sc.bg }]}>
                            <Text style={[styles.scoreText, { color: sc.text }]}>{candidate.score}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            );
          })}
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
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerGradient: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: T.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: T.accent,
    marginTop: 2,
  },
  boardScroll: {
    flex: 1,
  },
  board: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 14,
    alignItems: 'flex-start',
  },
  column: {
    width: 240,
    maxHeight: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: T.foreground,
    flex: 1,
  },
  countBadge: {
    backgroundColor: T.surface,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: T.border,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: T.muted,
  },
  columnBody: {
    maxHeight: 500,
  },
  emptyColumn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: T.border,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyColumnText: {
    fontSize: 12,
    color: T.border,
    marginTop: 6,
  },
  candidateCard: {
    backgroundColor: T.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  candidateTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: T.white,
    fontSize: 12,
    fontWeight: '700',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 13,
    fontWeight: '700',
    color: T.foreground,
  },
  candidateRole: {
    fontSize: 11,
    color: T.muted,
    marginTop: 1,
  },
  scoreBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
});

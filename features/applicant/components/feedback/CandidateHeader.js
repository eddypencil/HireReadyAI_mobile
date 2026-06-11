// features/applicant/components/feedback/CandidateHeader.js
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../shared/context/ThemeContext';
import ScoreRing from './ScoreRing';

function getInitials(name = '') {
  return (name || '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}

export default function CandidateHeader({ app, percentile, percentileTag }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  if (!app) return null;

  const candidate = app.profiles || {};
  const job = app.job_postings;
  const isRejected = app.current_stage === 'rejected' || app.is_rejected === true;

  const allStages = (app.application_stages || [])
    .filter((s) => s.recruitment_stages)
    .sort((a, b) => (a.recruitment_stages.order_index || 0) - (b.recruitment_stages.order_index || 0));
  const scoredStages = allStages.filter((s) => s.score != null);
  const computedComposite =
    scoredStages.length > 0
      ? Math.round(scoredStages.reduce((sum, s) => sum + Number(s.score), 0) / scoredStages.length)
      : app?.composite_score ?? null;

  return (
    <LinearGradient
      colors={['#01497c', '#468faf']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.hero}
    >
      {/* decorative bubbles */}
      <View style={styles.bubble1} />
      <View style={styles.bubble2} />

      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(candidate.full_name || job?.title)}
          </Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {candidate.full_name || job?.title || 'Unknown'}
            </Text>
            {isRejected && (
              <View style={styles.rejectedBadge}>
                <Text style={styles.rejectedText}>Rejected</Text>
              </View>
            )}
            {!isRejected && app?.current_stage === 'hired' && (
              <View style={styles.hiredBadge}>
                <Text style={styles.hiredText}>Hired</Text>
              </View>
            )}
          </View>

          {candidate.headline && (
            <Text style={styles.headline} numberOfLines={2}>{candidate.headline}</Text>
          )}

          <View style={styles.metaList}>
            {(candidate.email || app?.answers?.info?.email) && (
              <View style={styles.metaItem}>
                <Ionicons name="mail-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {candidate.email || app.answers.info.email}
                </Text>
              </View>
            )}
            {job?.title && (
              <View style={styles.metaItem}>
                <Ionicons name="document-text-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.metaText} numberOfLines={1}>
                  Applied for: <Text style={styles.metaBold}>{job.title}</Text>
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Score glass card */}
      <View style={styles.scoreCard}>
        <ScoreRing score={computedComposite} percentileTag={percentileTag} onDark />
        <View style={styles.scoreText}>
          <Text style={styles.scoreLabel}>Composite score</Text>
          {percentileTag ? (
            <Text style={styles.scoreSub}>
              {percentileTag.label} — top performers for this role
            </Text>
          ) : (
            <Text style={styles.scoreSub}>
              Averaged across {scoredStages.length} scored stages
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

function createStyles(c) {
  return StyleSheet.create({
  hero: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  bubble1: {
    position: 'absolute', top: -50, right: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bubble2: {
    position: 'absolute', bottom: -60, left: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, position: 'relative' },
  avatar: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 19, fontWeight: '700', color: c.white, letterSpacing: 0.5 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 18, fontWeight: '700', color: c.white, flexShrink: 1, letterSpacing: -0.2 },
  rejectedBadge: {
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  rejectedText: { fontSize: 10, fontWeight: '700', color: c.red[100], letterSpacing: 0.5 },
  hiredBadge: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  hiredText: { fontSize: 10, fontWeight: '700', color: c.emerald[200], letterSpacing: 0.5 },
  headline: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4, lineHeight: 17 },
  metaList: { marginTop: 8, gap: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: 'rgba(255,255,255,0.75)', flex: 1 },
  metaBold: { fontWeight: '600', color: c.white },

  scoreCard: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    position: 'relative',
  },
  scoreText: { flex: 1 },
  scoreLabel: {
    fontSize: 10, fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase', letterSpacing: 1.4,
  },
  scoreSub: { fontSize: 13, color: c.white, marginTop: 4, lineHeight: 18 },
});
}

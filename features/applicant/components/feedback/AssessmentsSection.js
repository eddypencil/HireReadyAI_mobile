// features/applicant/components/feedback/AssessmentsSection.js
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../../src/theme';
import StageSelector from './StageSelector';
import ExpandableQuestion from './ExpandableQuestion';

const GRADIENT = colors.gradient;

export default function AssessmentsSection({ stagesWithQuestions, activeStage, onSelectStage, candidateName, jobTitle }) {
  const isEmpty = stagesWithQuestions.length === 0 || stagesWithQuestions.every(s => s.questions.length === 0);
  const totalQ = stagesWithQuestions.reduce((a, s) => a + s.questions.length, 0);
  const evalData = (() => { const e = activeStage?.application_stage_evaluations; return Array.isArray(e) ? e[0] : e; })();

  const stageScoreColor = activeStage?.score >= 80 ? { bg: colors.emerald[100], text: colors.emerald[600] }
    : activeStage?.score >= 60 ? { bg: colors.accentSoftBg, text: colors.primary }
    : { bg: colors.amber[100], text: colors.amber[800] };

  const statusColor = activeStage?.status === 'passed' ? colors.emerald[600]
    : activeStage?.status === 'failed' ? colors.red[600]
    : activeStage?.status === 'in_progress' ? colors.primary
    : colors.muted;

  return (
    <View style={styles.container}>
      {/* Gradient Hero */}
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.b1} />
        <View style={styles.b2} />
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Assessments & Interviews</Text>
            <Text style={styles.heroSub}>{candidateName || jobTitle || ''}</Text>
          </View>
          {!isEmpty && (
            <View style={styles.totalBadge}>
              <Text style={styles.totalText}>{totalQ} questions</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Stage card */}
      <View style={styles.card}>
        <StageSelector stages={stagesWithQuestions} activeStage={activeStage} onSelect={onSelectStage} />

        {isEmpty && (
          <View style={styles.empty}>
            <Ionicons name="bulb-outline" size={40} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Assessment Data</Text>
            <Text style={styles.emptySub}>No interviews or assessments completed yet.</Text>
          </View>
        )}

        {!isEmpty && activeStage && (
          <View style={styles.stageHeader}>
            <View style={styles.stageLeft}>
              <View style={styles.stageIcon}>
                <Ionicons name="bulb-outline" size={18} color="#ffffff" />
              </View>
              <View style={styles.stageInfo}>
                <Text style={styles.stageName}>{activeStage.recruitment_stages?.name}</Text>
                <Text style={styles.stageType}>{activeStage.recruitment_stages?.stage_type?.replace(/_/g, ' ')}</Text>
              </View>
            </View>
            <View style={styles.stageRight}>
              {activeStage.score != null && (
                <View style={[styles.stagScore, { backgroundColor: stageScoreColor.bg }]}>
                  <Text style={[styles.stagScoreText, { color: stageScoreColor.text }]}>
                    {Math.round(activeStage.score)}/100
                  </Text>
                </View>
              )}
              <Text style={[styles.stageStatus, { color: statusColor }]}>
                {activeStage.status?.charAt(0).toUpperCase() + activeStage.status?.slice(1)}
              </Text>
            </View>
          </View>
        )}

        {evalData && (
          <View style={styles.evalGrid}>
            <View style={styles.evalCell}>
              <Text style={styles.evalLabel}>Recommendation</Text>
              <Text style={[styles.evalVal, {
                color: evalData.recommendation === 'proceed' ? colors.emerald[600]
                  : evalData.recommendation === 'review' ? colors.amber[600] : colors.red[600]
              }]}>
                {evalData.recommendation?.charAt(0).toUpperCase() + evalData.recommendation?.slice(1) || 'N/A'}
              </Text>
            </View>
            <View style={styles.evalCell}>
              <Text style={styles.evalLabel}>Confidence</Text>
              <Text style={styles.evalVal}>
                {evalData.confidence != null ? `${Math.round(Number(evalData.confidence) * 100)}%` : 'N/A'}
              </Text>
            </View>
            <View style={styles.evalCell}>
              <Text style={styles.evalLabel}>Questions</Text>
              <Text style={styles.evalVal}>{activeStage?.questions?.length || 0}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Questions */}
      {activeStage?.questions?.length > 0 && (
        <View style={styles.questions}>
          {activeStage.questions.map((q, i) => (
            <ExpandableQuestion key={q.id} question={q} index={i} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },

  hero: {
    borderRadius: 20, padding: 20, overflow: 'hidden',
    shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  b1: {
    position: 'absolute', top: -40, right: -40,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  b2: {
    position: 'absolute', bottom: -30, left: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' },
  heroTitle: { fontSize: 17, fontWeight: '700', color: colors.white, letterSpacing: -0.2 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  totalBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
  },
  totalText: { fontSize: 11, fontWeight: '700', color: colors.white },

  card: {
    backgroundColor: colors.white, borderRadius: 18,
    borderWidth: 1, borderColor: colors.line, overflow: 'hidden',
    shadowColor: colors.primary, shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  empty: { alignItems: 'center', padding: 40, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  emptySub: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19 },

  stageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  stageLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  stageIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stageInfo: { flex: 1 },
  stageName: { fontSize: 14, fontWeight: '700', color: colors.ink },
  stageType: { fontSize: 11, color: colors.muted, textTransform: 'capitalize', marginTop: 2 },
  stageRight: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  stagScore: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  stagScoreText: { fontSize: 12, fontWeight: '700' },
  stageStatus: { fontSize: 11, fontWeight: '600' },

  evalGrid: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: colors.line,
    paddingVertical: 14, paddingHorizontal: 16,
  },
  evalCell: { flex: 1 },
  evalLabel: { fontSize: 9, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  evalVal: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 4 },
  questions: { gap: 10 },
});

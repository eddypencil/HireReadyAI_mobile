// features/applicant/components/feedback/CvReviewSection.js
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../../src/theme';
import DimensionBar from './DimensionBar';

const GRADIENT = colors.gradient;

function parseAIFeedback(stage) {
  if (!stage?.ai_feedback) return null;
  try { return JSON.parse(stage.ai_feedback); } catch { return null; }
}

export default function CvReviewSection({ app }) {
  if (!app) return null;
  const allStages = (app.application_stages || [])
    .filter(s => s.recruitment_stages)
    .sort((a, b) => (a.recruitment_stages.order_index || 0) - (b.recruitment_stages.order_index || 0));
  const cvStage = allStages.find(s => s.recruitment_stages?.stage_type === 'cv_review');
  const cv = parseAIFeedback(cvStage);

  if (!cv) {
    return (
      <View style={[styles.card, styles.emptyCard]}>
        <Ionicons name="document-text-outline" size={40} color={colors.gray[300]} />
        <Text style={styles.emptyTitle}>No CV Review Data</Text>
        <Text style={styles.emptySubtitle}>CV has not been reviewed yet.</Text>
      </View>
    );
  }

  const recBg = cv.recommendation === 'proceed' ? colors.emerald[500]
    : cv.recommendation === 'review' ? colors.amber[400]
    : colors.red[500];
  const recText = cv.recommendation === 'proceed' ? colors.emerald[900]
    : cv.recommendation === 'review' ? colors.amber[900]
    : colors.white;

  return (
    <View style={styles.container}>
      {/* Gradient Hero */}
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.bubble1} />
        <View style={styles.bubble2} />
        <View style={styles.heroInner}>
          <View style={styles.heroHeader}>
            <View style={styles.heroLeft}>
              <Ionicons name="sparkles" size={18} color="#ffffff" />
              <Text style={styles.heroTitle}>AI CV Review</Text>
            </View>
            <View style={[styles.recBadge, { backgroundColor: recBg }]}>
              <Text style={[styles.recText, { color: recText }]}>
                {cv.recommendation?.toUpperCase() || 'N/A'}
              </Text>
            </View>
          </View>
          <Text style={styles.heroFeedback}>{cv.feedback}</Text>
        </View>
      </LinearGradient>

      {/* Dimension scores */}
      {cv.dimension_scores && (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrap}>
              <Ionicons name="bar-chart-outline" size={14} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Dimension Scores</Text>
          </View>
          <View style={styles.bars}>
            {Object.entries(cv.dimension_scores).map(([key, val]) => (
              <DimensionBar
                key={key}
                label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                score={val}
              />
            ))}
          </View>
        </View>
      )}

      {/* Strengths */}
      {cv.strengths?.length > 0 && (
        <View style={[styles.card, styles.strengthCard]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={16} color={colors.emerald[600]} />
            <Text style={[styles.sectionLabel, { color: colors.emerald[600] }]}>STRENGTHS</Text>
          </View>
          {cv.strengths.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <View style={[styles.bullet, { backgroundColor: colors.emerald[300] }]} />
              <Text style={[styles.listText, { color: colors.emerald[700] }]}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Weaknesses */}
      {cv.weaknesses?.length > 0 && (
        <View style={[styles.card, styles.weakCard]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="close-circle" size={16} color={colors.red[600]} />
            <Text style={[styles.sectionLabel, { color: colors.red[600] }]}>WEAKNESSES</Text>
          </View>
          {cv.weaknesses.map((w, i) => (
            <View key={i} style={styles.listRow}>
              <View style={[styles.bullet, { backgroundColor: colors.red[300] }]} />
              <Text style={[styles.listText, { color: colors.red[700] }]}>{w}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Gaps */}
      {cv.gaps?.length > 0 && (
        <View style={[styles.card, styles.gapCard]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={16} color={colors.amber[600]} />
            <Text style={[styles.sectionLabel, { color: colors.amber[700] }]}>GAPS</Text>
          </View>
          {cv.gaps.map((g, i) => (
            <View key={i} style={styles.listRow}>
              <View style={[styles.bullet, { backgroundColor: colors.amber[300] }]} />
              <Text style={[styles.listText, { color: colors.amber[800] }]}>{g}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  card: {
    backgroundColor: colors.white, borderRadius: 18,
    borderWidth: 1, borderColor: colors.line, padding: 18,
    shadowColor: colors.primary, shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  emptyCard: { alignItems: 'center', paddingVertical: 44, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  emptySubtitle: { fontSize: 13, color: colors.muted },

  hero: {
    borderRadius: 20, padding: 20, overflow: 'hidden',
    shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  bubble1: {
    position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bubble2: {
    position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroInner: { position: 'relative' },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroTitle: { fontSize: 16, fontWeight: '700', color: colors.white, letterSpacing: -0.2 },
  recBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  recText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  heroFeedback: { fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 22 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  iconWrap: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: colors.accentSoftBg,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  bars: { gap: 14 },

  strengthCard: { backgroundColor: colors.emerald[50], borderColor: colors.emerald[200] },
  weakCard: { backgroundColor: colors.red[50], borderColor: colors.red[200] },
  gapCard: { backgroundColor: colors.white, borderColor: colors.amber[200] },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  listText: { flex: 1, fontSize: 14, lineHeight: 21 },
});

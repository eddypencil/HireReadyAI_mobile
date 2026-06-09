import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCandidateProfile, getJobScorePercentile, getPercentileTag } from '../services/candidateProfile.service';
import { colors } from '../../../src/theme';

function getInitials(name = '') {
  return (name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function parseAIFeedback(stage) {
  if (!stage?.ai_feedback) return null;
  try {
    return typeof stage.ai_feedback === 'string' ? JSON.parse(stage.ai_feedback) : stage.ai_feedback;
  } catch {
    return null;
  }
}

function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    isDark,
    background: isDark ? '#0b1120' : colors.surface,
    surface: isDark ? '#152032' : colors.white,
    card: isDark ? '#152032' : colors.white,
    border: isDark ? '#1e3048' : colors.border,
    foreground: isDark ? '#e2e8f0' : colors.foreground,
    muted: isDark ? '#8899b4' : colors.mutedForeground,
    primary: colors.primary,
    accent: colors.accent,
    success: colors.emerald[500],
    danger: colors.red[500],
    warning: colors.amber[500],
  };
}

function DimensionBar({ label, score, theme }) {
  const barColor = score >= 80 ? theme.success : score >= 60 ? theme.primary : score >= 40 ? theme.warning : theme.danger;
  return (
    <View style={dimStyles.row}>
      <Text style={[dimStyles.label, { color: theme.muted }]} numberOfLines={1}>{label}</Text>
      <View style={[dimStyles.track, { backgroundColor: theme.border }]}>
        <View style={[dimStyles.fill, { width: `${Math.min(score, 100)}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[dimStyles.score, { color: theme.foreground }]}>{Math.round(score)}</Text>
    </View>
  );
}

const dimStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '600', width: 100 },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  score: { fontSize: 13, fontWeight: '700', width: 28, textAlign: 'right' },
});

function BulletList({ items, color, icon }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={[bulStyles.container, { backgroundColor: color + '10', borderColor: color + '30' }]}>
      {items.map((item, i) => (
        <View key={i} style={bulStyles.item}>
          <Ionicons name={icon} size={14} color={color} style={bulStyles.icon} />
          <Text style={[bulStyles.text, { color }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const bulStyles = StyleSheet.create({
  container: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  icon: { marginRight: 6, marginTop: 1 },
  text: { fontSize: 13, flex: 1, lineHeight: 18 },
});

function StageScoreCard({ stages, onViewAssessments, theme, interviewCount }) {
  if (!stages || stages.length === 0) return null;
  const sorted = [...stages].sort((a, b) => (a.recruitment_stages?.order_index || 0) - (b.recruitment_stages?.order_index || 0));
  return (
    <View style={[sectionStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={sectionStyles.cardHeader}>
        <Ionicons name="trophy-outline" size={16} color={theme.primary} />
        <Text style={[sectionStyles.cardTitle, { color: theme.foreground }]}>Stage Scores</Text>
      </View>
      {sorted.map(stage => {
        const statusColor = stage.status === 'passed' ? theme.success
          : stage.status === 'failed' ? theme.danger
          : stage.status === 'in_progress' ? theme.primary
          : theme.muted;
        const stageName = stage.recruitment_stages?.name || stage.recruitment_stages?.stage_type || 'Unknown';
        return (
          <View key={stage.id} style={sectionStyles.stageRow}>
            <View style={[sectionStyles.dot, { backgroundColor: statusColor }]} />
            <Text style={[sectionStyles.stageName, { color: theme.foreground }]} numberOfLines={1}>{stageName}</Text>
            {stage.score != null && (
              <View style={[sectionStyles.scorePill, {
                backgroundColor: stage.score >= 80 ? theme.success + '20' : stage.score >= 60 ? theme.primary + '20' : theme.danger + '20',
              }]}>
                <Text style={[sectionStyles.scorePillText, {
                  color: stage.score >= 80 ? theme.success : stage.score >= 60 ? theme.primary : theme.danger,
                }]}>{Math.round(stage.score)}</Text>
              </View>
            )}
            <Text style={[sectionStyles.statusText, { color: statusColor }]}>
              {stage.status === 'in_progress' ? 'In Progress' : stage.status ? stage.status.charAt(0).toUpperCase() + stage.status.slice(1) : 'Pending'}
            </Text>
          </View>
        );
      })}
      {interviewCount > 0 && (
        <TouchableOpacity style={sectionStyles.assessLink} onPress={onViewAssessments}>
          <Ionicons name="document-text-outline" size={16} color={theme.accent} />
          <Text style={[sectionStyles.assessLinkText, { color: theme.accent }]}>
            Assessment & Interview Results ({interviewCount} stage{interviewCount > 1 ? 's' : ''})
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stageName: { fontSize: 13, fontWeight: '500', flex: 1 },
  scorePill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  scorePillText: { fontSize: 12, fontWeight: '700' },
  statusText: { fontSize: 11, fontWeight: '600', minWidth: 70, textAlign: 'right' },
  assessLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  assessLinkText: { flex: 1, fontSize: 13, fontWeight: '600' },
});

export default function CandidateProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { applicationId } = route.params || {};

  const [profile, setProfile] = useState(null);
  const [percentile, setPercentile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applicationId) return;
    loadProfile();
  }, [applicationId]);

  async function loadProfile() {
    setLoading(true);
    try {
      const { data, error: err } = await getCandidateProfile(applicationId);
      if (err) { setError(err.message); return; }
      setProfile(data);
      if (data?.job_postings?.id && data.composite_score != null && data.composite_score !== 0) {
        const { percentile: p } = await getJobScorePercentile(data.job_postings.id, data.composite_score);
        setPercentile(p);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.danger} />
        <Text style={[styles.errorText, { color: theme.danger }]}>{error || 'Candidate not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backLink, { color: theme.accent }]}>Back to pipeline</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const app = profile;
  const candidate = app.profiles || {};
  const stages = (app.application_stages || []).sort(
    (a, b) => (a.recruitment_stages?.order_index || 0) - (b.recruitment_stages?.order_index || 0),
  );
  const cvStage = stages.find(s => s.recruitment_stages?.stage_type === 'cv_review');
  const cvFeedback = parseAIFeedback(cvStage);

  const scoredStages = stages.filter(s => s.score != null);
  const computedComposite = scoredStages.length > 0
    ? Math.round(scoredStages.reduce((sum, s) => sum + Number(s.score), 0) / scoredStages.length)
    : (app.composite_score ?? null);

  const percentileTag = getPercentileTag(percentile);

  const interviewStages = stages.filter(s =>
    ['assessment_test', 'coding_test', 'video_interview', 'technical_interview', 'hr_interview', 'manager_interview', 'ai_screening'].includes(s.recruitment_stages?.stage_type),
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Back button */}
      <TouchableOpacity style={[styles.backBtn, { paddingTop: insets.top + 8 }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
        <Text style={[styles.backBtnText, { color: colors.primary }]}>Back to Pipeline</Text>
      </TouchableOpacity>

      {/* Candidate Header */}
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.headerRow}>
          <View style={[styles.avatarLarge, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '40' }]}>
            <Text style={[styles.avatarLargeText, { color: theme.primary }]}>{getInitials(candidate.full_name)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.headerNameRow}>
              <Text style={[styles.headerName, { color: theme.foreground }]}>{candidate.full_name || 'Unknown Candidate'}</Text>
              {app.is_rejected && (
                <View style={styles.rejectedBadge}>
                  <Text style={styles.rejectedBadgeText}>Rejected</Text>
                </View>
              )}
            </View>
            {candidate.headline && (
              <Text style={[styles.headerHeadline, { color: theme.muted }]}>{candidate.headline}</Text>
            )}
            <View style={styles.headerMeta}>
              {app.job_postings?.title && (
                <View style={styles.metaItem}>
                  <Ionicons name="briefcase-outline" size={13} color={theme.muted} />
                  <Text style={[styles.metaText, { color: theme.muted }]}>{app.job_postings.title}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Composite Score */}
          <View style={styles.compositeWrap}>
            <View style={[styles.compositeCircle, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
              <Text style={[styles.compositeScore, { color: theme.primary }]}>{computedComposite ?? '--'}</Text>
            </View>
            <Text style={[styles.compositeLabel, { color: theme.muted }]}>Composite</Text>
            {percentileTag && (
              <View style={[styles.percentileBadge, { backgroundColor: colors.amber[50], borderColor: colors.amber[200] }]}>
                <Text style={[styles.percentileText, { color: colors.amber[700] }]}>{percentileTag.label}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* AI CV Review */}
      {cvFeedback ? (
        <View style={[styles.cvBanner, { backgroundColor: theme.accent + '10', borderColor: theme.accent + '30' }]}>
          <View style={styles.cvBannerHeader}>
            <View style={styles.cvBannerTitleRow}>
              <Ionicons name="sparkles" size={20} color={theme.accent} />
              <Text style={[styles.cvBannerTitle, { color: theme.foreground }]}>AI CV Review</Text>
            </View>
            <View style={[styles.recoBadge, {
              backgroundColor: cvFeedback.recommendation === 'proceed' ? theme.success + '20' : cvFeedback.recommendation === 'review' ? theme.warning + '20' : theme.danger + '20',
            }]}>
              <Text style={[styles.recoBadgeText, {
                color: cvFeedback.recommendation === 'proceed' ? theme.success : cvFeedback.recommendation === 'review' ? theme.warning : theme.danger,
              }]}>{cvFeedback.recommendation?.toUpperCase() || 'N/A'}</Text>
            </View>
          </View>
          <Text style={[styles.cvFeedbackText, { color: theme.muted }]}>{cvFeedback.feedback}</Text>

          {/* Dimension Scores */}
          {cvFeedback.dimension_scores && (
            <View style={styles.dimSection}>
              <View style={styles.dimHeader}>
                <Ionicons name="bar-chart-outline" size={15} color={theme.primary} />
                <Text style={[styles.dimHeaderText, { color: theme.foreground }]}>Dimension Scores</Text>
              </View>
              {Object.entries(cvFeedback.dimension_scores).map(([key, val]) => (
                <DimensionBar key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} score={val} theme={theme} />
              ))}
            </View>
          )}

          {/* Strengths / Weaknesses / Gaps */}
          {cvFeedback.strengths?.length > 0 && (
            <BulletList items={cvFeedback.strengths} color={theme.success} icon="checkmark-circle" />
          )}
          {cvFeedback.weaknesses?.length > 0 && (
            <BulletList items={cvFeedback.weaknesses} color={theme.danger} icon="close-circle" />
          )}
          {cvFeedback.gaps?.length > 0 && (
            <BulletList items={cvFeedback.gaps} color={theme.warning} icon="alert-circle" />
          )}
        </View>
      ) : (
        <View style={[styles.noCvCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="document-text-outline" size={36} color={theme.border} />
          <Text style={[styles.noCvText, { color: theme.muted }]}>No CV review data available</Text>
          <Text style={[styles.noCvSubtext, { color: theme.muted }]}>CV has not been reviewed yet.</Text>
        </View>
      )}

      {/* Stage Scores */}
      <StageScoreCard
        stages={stages}
        interviewCount={interviewStages.length}
        theme={theme}
        onViewAssessments={() => navigation.navigate('CandidateAssessments', { applicationId })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  backLink: { fontSize: 14, fontWeight: '600', marginTop: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingBottom: 8 },
  backBtnText: { fontSize: 14, fontWeight: '600' },
  headerCard: { borderRadius: 14, borderWidth: 1, marginHorizontal: 16, padding: 16, marginBottom: 16 },
  headerRow: { flexDirection: 'row', gap: 14 },
  avatarLarge: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarLargeText: { fontSize: 20, fontWeight: '700' },
  headerInfo: { flex: 1 },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  headerName: { fontSize: 18, fontWeight: '700' },
  rejectedBadge: {
    backgroundColor: colors.red[50], borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: colors.red[200],
  },
  rejectedBadgeText: { fontSize: 11, fontWeight: '700', color: colors.red[600] },
  headerHeadline: { fontSize: 13, marginTop: 2 },
  headerMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  compositeWrap: { alignItems: 'center', gap: 4 },
  compositeCircle: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  compositeScore: { fontSize: 22, fontWeight: '800' },
  compositeLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  percentileBadge: {
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1,
  },
  percentileText: { fontSize: 10, fontWeight: '700' },
  cvBanner: { borderRadius: 14, borderWidth: 1, marginHorizontal: 16, padding: 16, marginBottom: 16 },
  cvBannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cvBannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cvBannerTitle: { fontSize: 16, fontWeight: '700' },
  recoBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  recoBadgeText: { fontSize: 11, fontWeight: '800' },
  cvFeedbackText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  dimSection: { marginBottom: 12 },
  dimHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  dimHeaderText: { fontSize: 13, fontWeight: '700' },
  noCvCard: { borderRadius: 14, borderWidth: 1, marginHorizontal: 16, padding: 32, alignItems: 'center', marginBottom: 16 },
  noCvText: { fontSize: 15, fontWeight: '600', marginTop: 8 },
  noCvSubtext: { fontSize: 12, marginTop: 4 },
});

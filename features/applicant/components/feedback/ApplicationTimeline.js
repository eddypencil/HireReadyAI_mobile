// features/applicant/components/feedback/ApplicationTimeline.js
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';


export default function ApplicationTimeline({ stages }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const styles = createStyles(c);
  if (!stages || stages.length === 0) return null;
  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <Ionicons name="time-outline" size={15} color={c.primary} />
        <Text style={styles.heading}>{t('applicant.feedback.application_timeline')}</Text>
      </View>
      {stages.map((stage, i) => {
        const isPassed = stage.status === 'passed' || stage.status === 'completed';
        const isFailed = stage.status === 'failed';
        const isInProgress = stage.status === 'in_progress';
        const isLast = i === stages.length - 1;

        const dotBg = isPassed ? c.emerald[500]
          : isFailed ? c.red[500]
          : isInProgress ? c.primary
          : c.border;
        const dotHalo = isPassed ? c.emerald[100]
          : isFailed ? c.red[100]
          : isInProgress ? c['surface-muted']
          : 'transparent';
        const statusColor = isPassed ? c.emerald[600]
          : isFailed ? c.red[600]
          : isInProgress ? c.primary
          : c['muted-foreground'];
        const scoreColor = stage.score >= 80 ? { bg: c.emerald[100], text: c.emerald[600] }
          : stage.score >= 60 ? { bg: c['surface-muted'], text: c.primary }
          : stage.score >= 40 ? { bg: c.amber[100], text: c.amber[800] }
          : { bg: c.red[100], text: c.red[600] };

        return (
          <View key={stage.id} style={styles.row}>
            <View style={styles.dotCol}>
              <View style={[styles.haloOuter, { backgroundColor: dotHalo }]}>
                <View style={[styles.dot, { backgroundColor: dotBg }]}>
                  {isPassed && <Ionicons name="checkmark" size={13} color={c.white} />}
                  {isFailed && <Ionicons name="close" size={13} color={c.white} />}
                  {isInProgress && <Ionicons name="ellipsis-horizontal" size={13} color={c.white} />}
                  {!isPassed && !isFailed && !isInProgress && (
                    <Ionicons name="time-outline" size={11} color={c['muted-foreground']} />
                  )}
                </View>
              </View>
              {!isLast && <View style={styles.line} />}
            </View>
            <View style={[styles.content, isLast && { paddingBottom: 0 }]}>
              <View style={styles.between}>
                <View style={styles.textCol}>
                  <Text style={styles.stageName}>{stage.recruitment_stages?.name || 'Unknown'}</Text>
                  <Text style={styles.stageType}>
                    {stage.recruitment_stages?.stage_type?.replace(/_/g, ' ')}
                  </Text>
                </View>
                <View style={styles.rightMeta}>
                  {stage.score != null && (
                    <View style={[styles.scoreBadge, { backgroundColor: scoreColor.bg }]}>
                      <Text style={[styles.scoreText, { color: scoreColor.text }]}>
                        {Math.round(stage.score)}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {isInProgress ? t('applicant.feedback.in_progress') : stage.status
                      ? stage.status.charAt(0).toUpperCase() + stage.status.slice(1)
                      : t('applicant.feedback.pending')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
  card: {
    backgroundColor: c.card, borderRadius: 18,
    borderWidth: 1, borderColor: c.border, padding: 18,
    shadowColor: c.primary, shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  heading: { fontSize: 14, color: c.foreground, letterSpacing: -0.1, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  dotCol: { alignItems: 'center' },
  haloOuter: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  dot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  line: { width: 2, flex: 1, minHeight: 20, backgroundColor: c.border, marginVertical: 2 },
  content: { flex: 1, paddingBottom: 20, paddingTop: 4 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  textCol: { flex: 1, gap: 2, paddingRight: 8 },
  stageName: { fontSize: 13, color: c.foreground, fontWeight: '600' },
  stageType: { fontSize: 11, color: c['muted-foreground'], textTransform: 'capitalize' },
  rightMeta: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  scoreText: { fontSize: 11, fontWeight: '700' },
  statusText: { fontSize: 10, fontWeight: '600' },
});
}

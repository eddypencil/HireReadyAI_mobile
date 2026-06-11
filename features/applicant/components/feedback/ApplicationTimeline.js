// features/applicant/components/feedback/ApplicationTimeline.js
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme';

export default function ApplicationTimeline({ stages }) {
  if (!stages || stages.length === 0) return null;
  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <Ionicons name="time-outline" size={15} color={colors.primary} />
        <Text style={styles.heading}>Application Timeline</Text>
      </View>
      {stages.map((stage, i) => {
        const isPassed = stage.status === 'passed' || stage.status === 'completed';
        const isFailed = stage.status === 'failed';
        const isInProgress = stage.status === 'in_progress';
        const isLast = i === stages.length - 1;

        const dotBg = isPassed ? colors.emerald[500]
          : isFailed ? colors.red[500]
          : isInProgress ? colors.primary
          : colors.line;
        const dotHalo = isPassed ? colors.emerald[100]
          : isFailed ? colors.red[100]
          : isInProgress ? colors.accentSoftBg
          : 'transparent';
        const statusColor = isPassed ? colors.emerald[600]
          : isFailed ? colors.red[600]
          : isInProgress ? colors.primary
          : colors.muted;
        const scoreColor = stage.score >= 80 ? { bg: colors.emerald[100], text: colors.emerald[600] }
          : stage.score >= 60 ? { bg: colors.accentSoftBg, text: colors.primary }
          : stage.score >= 40 ? { bg: colors.amber[100], text: colors.amber[800] }
          : { bg: colors.red[100], text: colors.red[600] };

        return (
          <View key={stage.id} style={styles.row}>
            <View style={styles.dotCol}>
              <View style={[styles.haloOuter, { backgroundColor: dotHalo }]}>
                <View style={[styles.dot, { backgroundColor: dotBg }]}>
                  {isPassed && <Ionicons name="checkmark" size={13} color="#fff" />}
                  {isFailed && <Ionicons name="close" size={13} color="#fff" />}
                  {isInProgress && <Ionicons name="ellipsis-horizontal" size={13} color="#fff" />}
                  {!isPassed && !isFailed && !isInProgress && (
                    <Ionicons name="time-outline" size={11} color="#6b7d8f" />
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
                    {isInProgress ? 'In Progress' : stage.status
                      ? stage.status.charAt(0).toUpperCase() + stage.status.slice(1)
                      : 'Pending'}
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
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white, borderRadius: 18,
    borderWidth: 1, borderColor: colors.line, padding: 18,
    shadowColor: colors.primary, shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  heading: { fontSize: 14, fontWeight: '700', color: colors.ink, letterSpacing: -0.1 },
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
  line: { width: 2, flex: 1, minHeight: 20, backgroundColor: colors.line, marginVertical: 2 },
  content: { flex: 1, paddingBottom: 20, paddingTop: 4 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  textCol: { flex: 1, gap: 2, paddingRight: 8 },
  stageName: { fontSize: 13, fontWeight: '600', color: colors.ink },
  stageType: { fontSize: 11, color: colors.muted, textTransform: 'capitalize' },
  rightMeta: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  scoreText: { fontSize: 11, fontWeight: '700' },
  statusText: { fontSize: 10, fontWeight: '600' },
});

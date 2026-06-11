// features/applicant/components/feedback/KeyTakeaways.js
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme';

function collectStrings(arrays) {
  const map = new Map();
  arrays.forEach(arr => (arr || []).forEach(item => {
    const key = item.toLowerCase().trim();
    map.set(key, (map.get(key) || 0) + 1);
  }));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

export default function KeyTakeaways({ cvFeedback, stages }) {
  const allStrengths = [cvFeedback?.strengths || []];
  const allWeaknesses = [cvFeedback?.weaknesses || []];
  const allGaps = [cvFeedback?.gaps || []];

  (stages || []).forEach(stage => {
    const evals = stage.application_stage_evaluations;
    const evalData = Array.isArray(evals) ? evals[0] : evals;
    if (evalData) { allStrengths.push(evalData.strengths || []); allWeaknesses.push(evalData.weaknesses || []); }
    (stage.questions || []).forEach(q => {
      const ans = q.application_answers;
      const d = Array.isArray(ans) ? ans[0] : ans;
      if (d) { allStrengths.push(d.strengths || []); allWeaknesses.push(d.weaknesses || []); }
    });
  });

  const topS = collectStrings(allStrengths);
  const topW = collectStrings(allWeaknesses);
  const topG = collectStrings(allGaps);
  if (!topS.length && !topW.length && !topG.length && !cvFeedback?.feedback) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="bulb-outline" size={14} color={colors.primary} />
        </View>
        <Text style={styles.heading}>Key Takeaways</Text>
      </View>
      <View style={styles.body}>
        {cvFeedback?.feedback && <Text style={styles.feedback}>{cvFeedback.feedback}</Text>}
        {topS.length > 0 && (
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={16} color={colors.emerald[500]} style={styles.icon} />
            <Text style={styles.itemText}>
              <Text style={styles.sLabel}>Strength: </Text>
              <Text>{topS[0]}</Text>
              {topS.length > 1 && <Text style={styles.muted}>{` (also: ${topS.slice(1,3).join(', ')})`}</Text>}
            </Text>
          </View>
        )}
        {topW.length > 0 && (
          <View style={styles.row}>
            <Ionicons name="close-circle" size={16} color={colors.red[500]} style={styles.icon} />
            <Text style={styles.itemText}>
              <Text style={styles.wLabel}>Area to improve: </Text>
              <Text>{topW[0]}</Text>
              {topW.length > 1 && <Text style={styles.muted}>{` (also: ${topW.slice(1,3).join(', ')})`}</Text>}
            </Text>
          </View>
        )}
        {topG.length > 0 && (
          <View style={styles.row}>
            <Ionicons name="warning" size={16} color={colors.amber[500]} style={styles.icon} />
            <Text style={styles.itemText}>
              <Text style={styles.gLabel}>Gap: </Text>
              <Text>{topG.slice(0, 2).join(', ')}</Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white, borderRadius: 18,
    borderWidth: 1, borderColor: colors.line, padding: 18,
    shadowColor: colors.primary, shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  iconWrap: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: colors.accentSoftBg,
    alignItems: 'center', justifyContent: 'center',
  },
  heading: { fontSize: 14, fontWeight: '700', color: colors.ink, letterSpacing: -0.1 },
  body: { gap: 12 },
  feedback: { fontSize: 14, color: colors.ink2, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  icon: { marginTop: 1, flexShrink: 0 },
  itemText: { flex: 1, fontSize: 14, color: colors.ink2, lineHeight: 22 },
  sLabel: { fontWeight: '700', color: colors.emerald[600] },
  wLabel: { fontWeight: '700', color: colors.red[600] },
  gLabel: { fontWeight: '700', color: colors.amber[600] },
  muted: { color: colors.muted },
});

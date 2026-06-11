// features/applicant/components/feedback/DimensionBar.js
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../src/theme';

export default function DimensionBar({ label, score }) {
  const barColor = score >= 80 ? colors.emerald[500]
    : score >= 60 ? colors.secondary
    : score >= 40 ? colors.amber[500]
    : colors.red[500];
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${score}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.score}>{score}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: {
    fontSize: 13, color: colors.muted,
    width: 130, textTransform: 'capitalize', lineHeight: 18,
  },
  track: {
    flex: 1, height: 8,
    backgroundColor: colors.surface,
    borderRadius: 6, overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: 6 },
  score: { fontSize: 13, fontWeight: '700', color: colors.ink, width: 28, textAlign: 'right' },
});

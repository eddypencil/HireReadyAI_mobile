// features/applicant/components/feedback/DimensionBar.js
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/context/ThemeContext';

export default function DimensionBar({ label, score }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  const barColor = score >= 80 ? c.emerald[500]
    : score >= 60 ? c.secondary
    : score >= 40 ? c.amber[500]
    : c.red[500];
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
function createStyles(c) {
  return StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: {
    fontSize: 13, color: c['muted-foreground'],
    width: 130, textTransform: 'capitalize', lineHeight: 18,
  },
  track: {
    flex: 1, height: 8,
    backgroundColor: c.surface,
    borderRadius: 6, overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: 6 },
  score: { fontSize: 13, fontWeight: '700', color: c.foreground, width: 28, textAlign: 'right' },
});
}

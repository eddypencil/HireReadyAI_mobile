// features/applicant/components/feedback/SkillsToDevelop.js
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';

function collectSkills(arrays) {
  const seen = new Set(); const result = [];
  arrays.forEach(arr => (arr || []).forEach(item => {
    const key = item.toLowerCase().trim();
    if (!seen.has(key)) { seen.add(key); result.push(item); }
  }));
  return result;
}

export default function SkillsToDevelop({ cvFeedback, stages }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  const allW = [cvFeedback?.weaknesses || []];
  const allG = [cvFeedback?.gaps || []];
  (stages || []).forEach(stage => {
    const evals = stage.application_stage_evaluations;
    const d = Array.isArray(evals) ? evals[0] : evals;
    if (d) allW.push(d.weaknesses || []);
    (stage.questions || []).forEach(q => {
      const ans = q.application_answers;
      const a = Array.isArray(ans) ? ans[0] : ans;
      if (a) allW.push(a.weaknesses || []);
    });
  });
  const skills = collectSkills([...allW, ...allG]);
  if (skills.length === 0) return null;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="book-outline" size={14} color={c.primary} />
        </View>
        <Text style={styles.heading}>Skills to Develop</Text>
      </View>
      <Text style={styles.subtitle}>Based on your feedback, consider strengthening these areas:</Text>
      <View style={styles.pills}>
        {skills.slice(0, 8).map((skill, i) => (
          <View key={i} style={styles.pill}>
            <Text style={styles.pillText}>{skill}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
  card: {
    backgroundColor: c.white, borderRadius: 18,
    borderWidth: 1, borderColor: c.border, padding: 18,
    shadowColor: c.primary, shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  iconWrap: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: c['surface-muted'],
    alignItems: 'center', justifyContent: 'center',
  },
  heading: { fontSize: 14, fontWeight: '700', color: c.foreground },
  subtitle: { fontSize: 13, color: c.muted, marginBottom: 14, lineHeight: 19 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    backgroundColor: c['surface-muted'],
    borderWidth: 1, borderColor: c.secondary + '33',
  },
  pillText: { fontSize: 12, fontWeight: '600', color: c.primary },
});
}

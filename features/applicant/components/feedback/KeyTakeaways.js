// features/applicant/components/feedback/KeyTakeaways.js
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { FONT_FAMILY, FONT_FAMILY_BOLD } from '../../../../src/fonts';

function collectStrings(arrays) {
  const map = new Map();
  arrays.forEach(arr => (arr || []).forEach(item => {
    const key = item.toLowerCase().trim();
    map.set(key, (map.get(key) || 0) + 1);
  }));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

export default function KeyTakeaways({ cvFeedback, stages }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const styles = createStyles(c);
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
          <Ionicons name="bulb-outline" size={14} color={c.primary} />
        </View>
        <Text style={styles.heading}>{t('applicant.feedback.key_takeaways')}</Text>
      </View>
      <View style={styles.body}>
        {cvFeedback?.feedback && <Text style={styles.feedback}>{cvFeedback.feedback}</Text>}
        {topS.length > 0 && (
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={16} color={c.emerald[500]} style={styles.icon} />
            <Text style={styles.itemText}>
              <Text style={styles.sLabel}>{t('applicant.feedback.strength_label')}</Text>
              <Text>{topS[0]}</Text>
              {topS.length > 1 && <Text style={styles.muted}>{` ${t('applicant.feedback.also_suffix', { items: topS.slice(1,3).join(', ') })}`}</Text>}
            </Text>
          </View>
        )}
        {topW.length > 0 && (
          <View style={styles.row}>
            <Ionicons name="close-circle" size={16} color={c.red[500]} style={styles.icon} />
            <Text style={styles.itemText}>
              <Text style={styles.wLabel}>{t('applicant.feedback.area_to_improve')}</Text>
              <Text>{topW[0]}</Text>
              {topW.length > 1 && <Text style={styles.muted}>{` ${t('applicant.feedback.also_suffix', { items: topW.slice(1,3).join(', ') })}`}</Text>}
            </Text>
          </View>
        )}
        {topG.length > 0 && (
          <View style={styles.row}>
            <Ionicons name="warning" size={16} color={c.amber[500]} style={styles.icon} />
            <Text style={styles.itemText}>
              <Text style={styles.gLabel}>{t('applicant.feedback.gap_label')}</Text>
              <Text>{topG.slice(0, 2).join(', ')}</Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
  card: {
    backgroundColor: c.card, borderRadius: 18,
    borderWidth: 1, borderColor: c.border, padding: 18,
    shadowColor: c.primary, shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  iconWrap: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: c['surface-muted'],
    alignItems: 'center', justifyContent: 'center',
  },
  heading: { fontSize: 14, color: c.foreground, letterSpacing: -0.1, fontFamily: FONT_FAMILY_BOLD },
  body: { gap: 12 },
  feedback: { fontSize: 14, color: c['muted-foreground'], lineHeight: 22, fontFamily: FONT_FAMILY },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  icon: { marginTop: 1, flexShrink: 0 },
  itemText: { flex: 1, fontSize: 14, color: c['muted-foreground'], lineHeight: 22, fontFamily: FONT_FAMILY },
  sLabel: { color: c.emerald[600], fontFamily: FONT_FAMILY_BOLD },
  wLabel: { color: c.red[600], fontFamily: FONT_FAMILY_BOLD },
  gLabel: { color: c.amber[600], fontFamily: FONT_FAMILY_BOLD },
  muted: { color: c['muted-foreground'], fontFamily: FONT_FAMILY },
});
}

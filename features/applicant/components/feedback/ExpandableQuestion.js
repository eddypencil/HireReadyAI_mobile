import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';

const TYPE_ICONS = {
  video: 'videocam-outline',
  text: 'document-text-outline',
  code: 'code-slash-outline',
  multiple_choice: 'list-outline',
};
const TYPE_LABELS = {
  video: 'Video Response',
  text: 'Written Answer',
  code: 'Code Challenge',
  multiple_choice: 'Multiple Choice',
};

export default function ExpandableQuestion({ question, index }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [expanded, setExpanded] = useState(false);

  const answer = question.application_answers;
  const answerData = Array.isArray(answer) ? answer[0] : answer;
  const context = question.generation_context || {};
  const options = context.options || [];
  const language = context.language || null;
  const iconName = TYPE_ICONS[question.question_type] || 'document-text-outline';
  const typeLabel = TYPE_LABELS[question.question_type] || question.question_type;
  const iconStyle = (function () {
    switch (question.question_type) {
      case 'video': return { bg: c.red[50], color: '#e11d48' };
      case 'code': return { bg: '#eef2ff', color: '#4f46e5' };
      case 'multiple_choice': return { bg: c.amber[50], color: c.amber[600] };
      case 'text': return { bg: c.surface, color: c.accent };
      default: return { bg: c.surface, color: c.accent };
    }
  })();

  const scoreColor = answerData?.score >= 80 ? { bg: c.emerald[100], text: c.emerald[600] }
    : answerData?.score >= 60 ? { bg: c['surface-muted'], text: c.accent }
    : answerData?.score >= 40 ? { bg: c.amber[100], text: c.amber[800] }
    : { bg: c.red[100], text: c.red[600] };

  const styles = createStyles(c);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.header} activeOpacity={0.75}>
        <View style={[styles.iconBox, { backgroundColor: iconStyle.bg }]}>
          <Ionicons name={iconName} size={16} color={iconStyle.color} />
        </View>
        <View style={styles.headerText}>
          <View style={styles.metaRow}>
            <Text style={styles.typeLabel}>{typeLabel}</Text>
            {language && (
              <View style={styles.langBadge}>
                <Text style={styles.langText}>{language.toUpperCase()}</Text>
              </View>
            )}
          </View>
          <Text style={styles.questionText} numberOfLines={2}>{question.question_text}</Text>
        </View>
        <View style={styles.rightCol}>
          {answerData?.score != null && (
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor.bg }]}>
              <Text style={[styles.scoreText, { color: scoreColor.text }]}>
                {Math.round(answerData.score)}
              </Text>
            </View>
          )}
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={16} color={c['muted-foreground']}
          />
        </View>
      </TouchableOpacity>

      <View>
        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>ANSWER</Text>

            {question.question_type === 'text' && (
              <View style={styles.answerBox}>
                <Text style={styles.answerText}>{answerData?.answer_text || 'No answer provided.'}</Text>
              </View>
            )}

            {question.question_type === 'code' && (
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{answerData?.answer_text || 'No code submitted.'}</Text>
              </View>
            )}

            {question.question_type === 'video' && (
              <View style={styles.answerBox}>
                {answerData?.transcript
                  ? <Text style={styles.answerText}>{answerData.transcript}</Text>
                  : <Text style={styles.mutedText}>No transcript available.</Text>}
              </View>
            )}

            {question.question_type === 'multiple_choice' && options.length > 0 && (
              <View style={styles.optionsContainer}>
                {options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = answerData?.answer_text === opt;
                  return (
                    <View key={idx} style={[styles.optionRow, isSelected && styles.optionSelected]}>
                      <View style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
                        <Text style={[styles.optionLetterText, isSelected && { color: c.white }]}>
                          {letter}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, isSelected && { color: c.accent }]}>{opt}</Text>
                      {isSelected && <Ionicons name="checkmark" size={14} color={c.accent} />}
                    </View>
                  );
                })}
              </View>
            )}

            {(answerData?.feedback || answerData?.strengths?.length > 0 || answerData?.weaknesses?.length > 0) && (
              <View style={styles.aiFeedbackBox}>
                <View style={styles.aiFeedbackHeader}>
                  <Ionicons name="sparkles" size={13} color={c.accent} />
                  <Text style={styles.aiFeedbackLabel}>AI FEEDBACK</Text>
                </View>
                {answerData.feedback && (
                  <Text style={styles.aiFeedbackText}>{answerData.feedback}</Text>
                )}
                {answerData.strengths?.length > 0 && (
                  <View style={styles.feedbackSectionOuter}>
                    <View style={[styles.accentBar, { backgroundColor: theme.isDark ? c.emerald[400] : c.emerald[500] }]} />
                    <View style={styles.feedbackSectionInner}>
                      <View style={[styles.feedbackTag, { backgroundColor: `${theme.isDark ? c.emerald[400] : c.emerald[500]}18` }]}>
                        <Ionicons name="sparkles" size={11} color={theme.isDark ? c.emerald[300] : c.emerald[500]} />
                        <Text style={[styles.feedbackTagText, { color: theme.isDark ? c.emerald[300] : c.emerald[600] }]}>Strengths</Text>
                      </View>
                      {answerData.strengths.map((s, i) => (
                        <View key={i} style={styles.feedbackItem}>
                          <Text style={[styles.bullet, { color: theme.isDark ? c.emerald[400] : c.emerald[500] }]}>{'\u2022'}</Text>
                          <Text style={styles.feedbackItemText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {answerData.weaknesses?.length > 0 && (
                  <View style={styles.feedbackSectionOuter}>
                    <View style={[styles.accentBar, { backgroundColor: theme.isDark ? c.amber[400] : c.amber[500] }]} />
                    <View style={styles.feedbackSectionInner}>
                      <View style={[styles.feedbackTag, { backgroundColor: `${theme.isDark ? c.amber[400] : c.amber[500]}18` }]}>
                        <Ionicons name="bulb-outline" size={11} color={theme.isDark ? c.amber[300] : c.amber[500]} />
                        <Text style={[styles.feedbackTagText, { color: theme.isDark ? c.amber[300] : c.amber[600] }]}>Growth Areas</Text>
                      </View>
                      {answerData.weaknesses.map((w, i) => (
                        <View key={i} style={styles.feedbackItem}>
                          <Text style={[styles.bullet, { color: theme.isDark ? c.amber[400] : c.amber[500] }]}>{'\u2022'}</Text>
                          <Text style={styles.feedbackItemText}>{w}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {!answerData?.feedback &&
              (!answerData?.strengths || answerData.strengths.length === 0) &&
              (!answerData?.weaknesses || answerData.weaknesses.length === 0) && (
                <Text style={styles.mutedText}>No AI feedback available for this answer.</Text>
              )}
          </View>
        )}
      </View>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.card, borderRadius: 14,
      borderWidth: 1, borderColor: c.border, overflow: 'hidden',
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
    iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    typeLabel: { fontSize: 11, fontWeight: '600', color: c['muted-foreground'] },
    langBadge: { backgroundColor: c.surface, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
    langText: { fontSize: 9, fontWeight: '700', color: c['muted-foreground'] },
    questionText: { fontSize: 13, fontWeight: '500', color: c.foreground, lineHeight: 18 },
    rightCol: { alignItems: 'center', gap: 6 },
    scoreBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    scoreText: { fontSize: 11, fontWeight: '700' },
    expandedContent: { paddingHorizontal: 16, paddingBottom: 16 },
    divider: { height: 1, backgroundColor: c.border, marginBottom: 14 },
    sectionLabel: {
      fontSize: 10, fontWeight: '700', color: c['muted-foreground'],
      letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
    },
    answerBox: {
      backgroundColor: c.surface, borderRadius: 10,
      borderWidth: 1, borderColor: c.border, padding: 12,
    },
    answerText: { fontSize: 13, color: c.foreground, lineHeight: 20 },
    codeBox: { backgroundColor: '#1e2d3d', borderRadius: 10, padding: 12 },
    codeText: { fontSize: 12, color: c.white, lineHeight: 20 },
    mutedText: { fontSize: 12, color: c['muted-foreground'], fontStyle: 'italic' },
    optionsContainer: { gap: 6, marginBottom: 8 },
    optionRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      padding: 10, borderRadius: 8,
      borderWidth: 1, borderColor: c.border, backgroundColor: c.card,
    },
    optionSelected: { backgroundColor: c['surface-muted'], borderColor: `${c.accent}50` },
    optionLetter: {
      width: 22, height: 22, borderRadius: 11,
      backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center',
    },
    optionLetterSelected: { backgroundColor: c.accent },
    optionLetterText: { fontSize: 10, fontWeight: '700', color: c['muted-foreground'] },
    optionText: { fontSize: 13, color: c['muted-foreground'], flex: 1 },
    aiFeedbackBox: {
      backgroundColor: c.surface, borderRadius: 10,
      borderWidth: 1, borderColor: c.border, padding: 12, marginTop: 12,
    },
    aiFeedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    aiFeedbackLabel: { fontSize: 10, fontWeight: '700', color: c.accent, letterSpacing: 0.8 },
    aiFeedbackText: { fontSize: 13, color: c.foreground, lineHeight: 19, marginBottom: 8 },
    aiFeedbackText: { fontSize: 13, color: c.foreground, lineHeight: 19, marginBottom: 8 },
    feedbackSectionOuter: {
      flexDirection: 'row', marginTop: 10, borderRadius: 8, overflow: 'hidden',
      backgroundColor: c.surface,
    },
    accentBar: { width: 3 },
    feedbackSectionInner: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, gap: 4 },
    feedbackTag: {
      flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4,
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    feedbackTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    bullet: { fontSize: 16, lineHeight: 18, marginTop: -1 },
    feedbackItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 2 },
    feedbackItemText: { fontSize: 12, flex: 1, lineHeight: 17, color: c.foreground },
  });
}

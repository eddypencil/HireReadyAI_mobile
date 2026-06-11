// features/applicant/components/feedback/ExpandableQuestion.js
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme';

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
const TYPE_ICON_BG = {
  video: { bg: colors.red[50], color: '#e11d48' },
  code: { bg: '#eef2ff', color: '#4f46e5' },
  multiple_choice: { bg: colors.amber[50], color: colors.amber[600] },
  text: { bg: colors.surface, color: colors.accent },
};

export default function ExpandableQuestion({ question, index }) {
  const [expanded, setExpanded] = useState(false);

  const answer = question.application_answers;
  const answerData = Array.isArray(answer) ? answer[0] : answer;
  const context = question.generation_context || {};
  const options = context.options || [];
  const language = context.language || null;
  const iconName = TYPE_ICONS[question.question_type] || 'document-text-outline';
  const typeLabel = TYPE_LABELS[question.question_type] || question.question_type;
  const iconStyle = TYPE_ICON_BG[question.question_type] || TYPE_ICON_BG.text;

  const scoreColor = answerData?.score >= 80 ? { bg: colors.emerald[100], text: colors.emerald[600] }
    : answerData?.score >= 60 ? { bg: colors.accentSoftBg, text: colors.accent }
    : answerData?.score >= 40 ? { bg: colors.amber[100], text: colors.amber[800] }
    : { bg: colors.red[100], text: colors.red[600] };

  return (
    <View
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350, delay: index * 50 }}
      style={styles.card}
    >
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
            size={16} color={colors.mutedForeground}
          />
        </View>
      </TouchableOpacity>

      <View>
        {expanded && (
          <View
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 250 }}
            style={styles.expandedContent}
          >
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
                        <Text style={[styles.optionLetterText, isSelected && { color: colors.white }]}>
                          {letter}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, isSelected && { color: colors.accent }]}>{opt}</Text>
                      {isSelected && <Ionicons name="checkmark" size={14} color={colors.accent} />}
                    </View>
                  );
                })}
              </View>
            )}

            {(answerData?.feedback || answerData?.strengths?.length > 0 || answerData?.weaknesses?.length > 0) && (
              <View style={styles.aiFeedbackBox}>
                <View style={styles.aiFeedbackHeader}>
                  <Ionicons name="sparkles" size={13} color={colors.accent} />
                  <Text style={styles.aiFeedbackLabel}>AI FEEDBACK</Text>
                </View>
                {answerData.feedback && (
                  <Text style={styles.aiFeedbackText}>{answerData.feedback}</Text>
                )}
                {answerData.strengths?.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <Text style={[styles.feedbackSubLabel, { color: colors.emerald[600] }]}>STRENGTHS</Text>
                    {answerData.strengths.map((s, i) => (
                      <View key={i} style={styles.feedbackItem}>
                        <Ionicons name="checkmark" size={12} color={colors.emerald[600]} />
                        <Text style={[styles.feedbackItemText, { color: colors.emerald[700] }]}>{s}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {answerData.weaknesses?.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <Text style={[styles.feedbackSubLabel, { color: colors.red[600] }]}>WEAKNESSES</Text>
                    {answerData.weaknesses.map((w, i) => (
                      <View key={i} style={styles.feedbackItem}>
                        <Ionicons name="close" size={12} color={colors.red[600]} />
                        <Text style={[styles.feedbackItemText, { color: colors.red[700] }]}>{w}</Text>
                      </View>
                    ))}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  typeLabel: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  langBadge: { backgroundColor: colors.surface, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  langText: { fontSize: 9, fontWeight: '700', color: colors.mutedForeground },
  questionText: { fontSize: 13, fontWeight: '500', color: colors.foreground, lineHeight: 18 },
  rightCol: { alignItems: 'center', gap: 6 },
  scoreBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  scoreText: { fontSize: 11, fontWeight: '700' },
  expandedContent: { paddingHorizontal: 16, paddingBottom: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 14 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: colors.mutedForeground,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
  },
  answerBox: {
    backgroundColor: colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border, padding: 12,
  },
  answerText: { fontSize: 13, color: colors.foreground, lineHeight: 20 },
  codeBox: { backgroundColor: '#1e2d3d', borderRadius: 10, padding: 12 },
  codeText: { fontSize: 12, color: colors.white, lineHeight: 20 },
  mutedText: { fontSize: 12, color: colors.mutedForeground, fontStyle: 'italic' },
  optionsContainer: { gap: 6, marginBottom: 8 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 8,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
  optionSelected: { backgroundColor: colors.accentSoftBg, borderColor: `${colors.accent}50` },
  optionLetter: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  optionLetterSelected: { backgroundColor: colors.accent },
  optionLetterText: { fontSize: 10, fontWeight: '700', color: colors.mutedForeground },
  optionText: { fontSize: 13, color: colors.mutedForeground, flex: 1 },
  aiFeedbackBox: {
    backgroundColor: colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border, padding: 12, marginTop: 12,
  },
  aiFeedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiFeedbackLabel: { fontSize: 10, fontWeight: '700', color: colors.accent, letterSpacing: 0.8 },
  aiFeedbackText: { fontSize: 13, color: colors.foreground, lineHeight: 19, marginBottom: 8 },
  feedbackSection: { marginTop: 8 },
  feedbackSubLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  feedbackItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 3 },
  feedbackItemText: { fontSize: 12, flex: 1, lineHeight: 17 },
});
// src/features/applications/components/apply/QuestionCard.js
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors } from '../../../../src/theme';

export default function QuestionCard({ question, value, onChange, error }) {
  return (
    <View style={[styles.card, error && styles.cardError]}>
      <Text style={styles.questionText}>
        {question.question}
        <Text style={styles.required}> *</Text>
      </Text>

      {question.type === 'yes_no' && (
        <View style={styles.yesNoRow}>
          <TouchableOpacity
            style={[styles.yesNoButton, value === 'yes' && styles.yesNoSelected]}
            onPress={() => onChange('yes')}
            activeOpacity={0.7}
          >
            <Text style={[styles.yesNoText, value === 'yes' && styles.yesNoTextSelected]}>
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yesNoButton, value === 'no' && styles.yesNoSelected]}
            onPress={() => onChange('no')}
            activeOpacity={0.7}
          >
            <Text style={[styles.yesNoText, value === 'no' && styles.yesNoTextSelected]}>
              No
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {question.type === 'text' && (
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value || ''}
          onChangeText={onChange}
          placeholder="Your answer..."
          placeholderTextColor={colors.gray[400]}
        />
      )}

      {question.type === 'textarea' && (
        <TextInput
          style={[styles.textarea, error && styles.inputError]}
          value={value || ''}
          onChangeText={onChange}
          placeholder="Your answer..."
          placeholderTextColor={colors.gray[400]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  cardError: {
    borderColor: colors.red[300],
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    lineHeight: 20,
  },
  required: {
    color: colors.red[500],
  },
  yesNoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  yesNoButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  yesNoSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yesNoText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  yesNoTextSelected: {
    color: colors.white,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
    backgroundColor: colors.surface,
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
    backgroundColor: colors.surface,
    minHeight: 100,
  },
  inputError: {
    borderColor: colors.red[400],
  },
  errorText: {
    fontSize: 12,
    color: colors.red[500],
  },
});
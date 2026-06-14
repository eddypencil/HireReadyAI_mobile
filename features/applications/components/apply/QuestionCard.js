// src/features/applications/components/apply/QuestionCard.js
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { FONT_FAMILY, FONT_FAMILY_MEDIUM } from '../../../../src/fonts';

export default function QuestionCard({ question, value, onChange, error }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
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
              {t("applications.yes")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yesNoButton, value === 'no' && styles.yesNoSelected]}
            onPress={() => onChange('no')}
            activeOpacity={0.7}
          >
            <Text style={[styles.yesNoText, value === 'no' && styles.yesNoTextSelected]}>
              {t("applications.no")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {question.type === 'text' && (
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value || ''}
          onChangeText={onChange}
          placeholder="Answer here..."
          placeholderTextColor={c['muted-foreground']}
        />
      )}

      {question.type === 'textarea' && (
        <TextInput
          style={[styles.textarea, error && styles.inputError]}
          value={value || ''}
          onChangeText={onChange}
          placeholder="Answer here..."
          placeholderTextColor={c['muted-foreground']}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function createStyles(c) { return StyleSheet.create({
  card: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    padding: 16,
    gap: 10,
  },
  cardError: {
    borderColor: c.destructive,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: c.foreground,
    lineHeight: 20,
    fontFamily: FONT_FAMILY_MEDIUM,
  },
  required: {
    color: c.destructive,
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
    borderColor: c.border,
    alignItems: 'center',
    backgroundColor: c['surface-muted'],
  },
  yesNoSelected: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  yesNoText: {
    fontSize: 14,
    fontWeight: '500',
    color: c['muted-foreground'],
    fontFamily: FONT_FAMILY_MEDIUM,
  },
  yesNoTextSelected: {
    color: c['destructive-foreground'],
  },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: c.foreground,
    backgroundColor: c['surface-muted'],
    fontFamily: FONT_FAMILY,
  },
  textarea: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: c.foreground,
    backgroundColor: c['surface-muted'],
    minHeight: 100,
    fontFamily: FONT_FAMILY,
  },
  inputError: {
    borderColor: c.destructive,
  },
  errorText: {
    fontSize: 12,
    color: c.destructive,
    fontFamily: FONT_FAMILY,
  },
}); }
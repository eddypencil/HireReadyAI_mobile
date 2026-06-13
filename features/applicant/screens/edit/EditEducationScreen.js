// features/applicant/screens/edit/EditEducationScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { addEducation, updateEducation } from '../../services/education.service';
import { Education } from '../../models';
import { FONT_FAMILY, FONT_FAMILY_MEDIUM, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from '../../../../src/fonts';

const DEGREE_KEYS = ['high_school', 'diploma', 'bachelors', 'masters', 'phd', 'other'];

function Field({ label, value, onChangeText, placeholder, multiline, optional, styles, c }) {
  const { t } = useTranslation();
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}
        {optional && <Text style={styles.optional}> {t("companies.optional")}</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c['muted-foreground']}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        autoCapitalize="sentences"
      />
    </View>
  );
}

export default function EditEducationScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const navigation = useNavigation();
  const route = useRoute();
  const { profileId, item, itemIndex, onSave } = route.params || {};
  const isEdit = item != null && itemIndex != null;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    level:      item?.level      || '',
    university: item?.university || '',
    faculty:    item?.faculty    || '',
    major:      item?.major      || '',
    startYear:  item?.startYear  || '',
    endYear:    item?.endYear    || '',
    grade:      item?.grade      || '',
  });

  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.university.trim()) { Alert.alert(t("profile.error_title"), t("profile.edit.error_university")); return; }
    if (!form.startYear.trim()) { Alert.alert(t("profile.error_title"), t("profile.edit.error_start_year")); return; }

    setSaving(true);
    try {
      const education = new Education({
        level:     form.level.trim(),
        university:form.university.trim(),
        faculty:   form.faculty.trim(),
        major:     form.major.trim(),
        startYear: form.startYear.trim(),
        endYear:   form.endYear.trim(),
        grade:     form.grade.trim(),
      });

      if (isEdit) {
        await updateEducation(profileId, itemIndex, education.toJson());
      } else {
        await addEducation(profileId, education.toJson());
      }

      onSave?.();
      navigation.goBack();
    } catch {
      Alert.alert(t("profile.error_title"), t("profile.edit.error_save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Degree level picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("profile.edit.degree_level")} <Text style={styles.optional}>{t("companies.optional")}</Text></Text>
          <View style={styles.levelRow}>
            {DEGREE_KEYS.map(key => (
              <TouchableOpacity
                key={key}
                style={[styles.levelPill, form.level === t("profile.edit.degrees." + key) && styles.levelPillActive]}
                onPress={() => set('level')(t("profile.edit.degrees." + key))}
                activeOpacity={0.75}
              >
                <Text style={[styles.levelPillText, form.level === t("profile.edit.degrees." + key) && styles.levelPillTextActive]}>
                  {t("profile.edit.degrees." + key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Field label={t("profile.edit.university")} value={form.university} onChangeText={set('university')} placeholder="e.g. Cairo University" styles={styles} c={c} />
        <Field label={t("profile.edit.faculty")} value={form.faculty} onChangeText={set('faculty')} placeholder="e.g. Faculty of Engineering" optional styles={styles} c={c} />
        <Field label={t("profile.edit.major")} value={form.major} onChangeText={set('major')} placeholder="e.g. Systems & Biomedical Engineering" optional styles={styles} c={c} />
        <Field label={t("profile.edit.start_year")} value={form.startYear} onChangeText={set('startYear')} placeholder="e.g. 2020" styles={styles} c={c} />
        <Field label={t("profile.edit.end_year")} value={form.endYear} onChangeText={set('endYear')} placeholder="e.g. 2024  (leave blank if ongoing)" optional styles={styles} c={c} />
        <Field label={t("profile.edit.grade")} value={form.grade} onChangeText={set('grade')} placeholder="e.g. 3.8 / 4.0 or Excellent" optional styles={styles} c={c} />

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave} disabled={saving} activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={c.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? t("profile.save_changes") : t("profile.add_education")}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
  scroll: { flex: 1, backgroundColor: c.surface },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  fieldGroup: { gap: 8 },
  label: { fontFamily: FONT_FAMILY_SEMIBOLD, fontSize: 12, color: c.foreground, textTransform: 'uppercase', letterSpacing: 0.4 },
  optional: { fontFamily: FONT_FAMILY, fontWeight: '400', color: c['muted-foreground'], textTransform: 'none' },
  input: {
    fontFamily: FONT_FAMILY, backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: c.foreground,
  },
  inputMulti: { minHeight: 120, paddingTop: 12 },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelPill: {
    borderWidth: 1.5, borderColor: c.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: c.card,
  },
  levelPillActive: { backgroundColor: `${c.primary}15`, borderColor: c.primary },
  levelPillText: { fontFamily: FONT_FAMILY_MEDIUM, fontSize: 13, color: c['muted-foreground'] },
  levelPillTextActive: { fontFamily: FONT_FAMILY_BOLD, color: c.primary },
  saveBtn: {
    backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
    shadowColor: c.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { fontFamily: FONT_FAMILY_BOLD, color: c.white, fontSize: 15 },
  });
}
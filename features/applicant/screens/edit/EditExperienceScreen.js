// features/applicant/screens/edit/EditExperienceScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useThemedAlert } from '../../../../shared/context/ThemedAlertContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { addExperience, updateExperience } from '../../services/experience.service';
import { Experience } from '../../models';
import { FONT_FAMILY, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from '../../../../src/fonts';

function Field({ label, value, onChangeText, placeholder, multiline, optional, keyboardType, styles, c , t}) {
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
        keyboardType={keyboardType || 'default'}
        autoCapitalize="sentences"
      />
    </View>
  );
}

export default function EditExperienceScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { alert } = useThemedAlert();
  const c = theme.colors;
  const styles = createStyles(c);
  const navigation = useNavigation();
  const route = useRoute();
  // item = the existing Experience object (or null for new)
  // itemIndex = index in the array (for update)
  // profileId = the user's id
  // onSave = callback to reload profile after save
  const { profileId, item, itemIndex, onSave } = route.params || {};
  const isEdit = item != null && itemIndex != null;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title:       item?.title       || '',
    companyName: item?.companyName || '',
    industry:    item?.industry    || '',
    from:        item?.from        || '',
    to:          item?.to          || '',
    description: item?.description || '',
  });

  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { alert(t("profile.error_title"), t("profile.edit.error_job_title")); return; }
    if (!form.companyName.trim()) { alert(t("profile.error_title"), t("profile.edit.error_company_name")); return; }
    if (!form.from.trim()) { alert(t("profile.error_title"), t("profile.edit.error_start_date")); return; }

    setSaving(true);
    try {
      const experience = new Experience({
        title:       form.title.trim(),
        companyName: form.companyName.trim(),
        industry:    form.industry.trim(),
        from:        form.from.trim(),
        to:          form.to.trim(),
        description: form.description.trim(),
      });

      if (isEdit) {
        await updateExperience(profileId, itemIndex, experience.toJson());
      } else {
        await addExperience(profileId, experience.toJson());
      }

      onSave?.();
      navigation.goBack();
    } catch {
      alert(t("profile.error_title"), t("profile.edit.error_save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Field label={t("profile.edit.job_title")} value={form.title} onChangeText={set('title')} placeholder="e.g. Frontend Developer" styles={styles} c={c} t={t} />
        <Field label={t("profile.edit.company_name")} value={form.companyName} onChangeText={set('companyName')} placeholder="e.g. Vodafone Egypt" styles={styles} c={c} t={t}/>
        <Field label={t("profile.edit.industry")} value={form.industry} onChangeText={set('industry')} placeholder="e.g. Telecommunications" optional styles={styles} c={c} t={t}/>
        <Field label={t("profile.edit.from")} value={form.from} onChangeText={set('from')} placeholder="YYYY-MM  e.g. 2023-06" styles={styles} c={c} t={t} />
        <Field label={t("profile.edit.to")} value={form.to} onChangeText={set('to')} placeholder="YYYY-MM  or 'Present'" optional styles={styles} c={c} t={t}/>
        <Field label={t("profile.edit.description")} value={form.description} onChangeText={set('description')} placeholder="Describe your responsibilities and achievements..." multiline optional styles={styles} c={c}  t={t} />

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave} disabled={saving} activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={c.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? t("profile.save_changes") : t("profile.add_experience")}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
  scroll: { flex: 1, backgroundColor: c.surface },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  fieldGroup: { gap: 6 },
  label: { fontFamily: FONT_FAMILY_SEMIBOLD, fontSize: 12, color: c.foreground, textTransform: 'uppercase', letterSpacing: 0.4 },
  optional: { fontFamily: FONT_FAMILY, fontWeight: '400', color: c['muted-foreground'], textTransform: 'none' },
  input: {
    backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: FONT_FAMILY, fontSize: 14, color: c.foreground,
  },
  inputMulti: { minHeight: 120, paddingTop: 12 },
  saveBtn: {
    backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
    shadowColor: c.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { fontFamily: FONT_FAMILY_BOLD, color: c.white, fontSize: 15 },
  });
}
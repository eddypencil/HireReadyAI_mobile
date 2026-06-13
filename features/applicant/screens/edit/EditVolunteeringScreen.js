// features/applicant/screens/edit/EditVolunteeringScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { addVolunteering, updateVolunteering } from '../../services/volunteering.service';
import { Volunteering } from '../../models';
import { FONT_FAMILY, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from '../../../../src/fonts';

function Field({ label, value, onChangeText, placeholder, multiline, optional, styles, c }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}{optional && <Text style={styles.optional}> {t("companies.optional")}</Text>}
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

export default function EditVolunteeringScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const navigation = useNavigation();
  const { profileId, item, itemIndex } = useRoute().params || {};
  const isEdit = item != null && itemIndex != null;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    role:         item?.role         || '',
    organization: item?.organization || '',
    start:        item?.start        || '',
    end:          item?.end          || '',
    description:  item?.description  || '',
  });

  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.role.trim()) { Alert.alert(t("profile.error_title"), t("profile.edit.error_role")); return; }
    if (!form.organization.trim()) { Alert.alert(t("profile.error_title"), t("profile.edit.error_organization")); return; }
    setSaving(true);
    try {
      const vol = new Volunteering({
        role:         form.role.trim(),
        organization: form.organization.trim(),
        start:        form.start.trim(),
        end:          form.end.trim(),
        description:  form.description.trim(),
      });
      if (isEdit) {
        await updateVolunteering(profileId, itemIndex, vol.toJson());
      } else {
        await addVolunteering(profileId, vol.toJson());
      }
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
        <Field label={t("profile.edit.role")} value={form.role} onChangeText={set('role')} placeholder={t("profile.edit.role_placeholder")} styles={styles} c={c} />
        <Field label={t("profile.edit.organization")} value={form.organization} onChangeText={set('organization')} placeholder={t("profile.edit.organization_placeholder")} styles={styles} c={c} />
        <Field label={t("profile.edit.start_date")} value={form.start} onChangeText={set('start')} placeholder={t("profile.edit.start_date_placeholder")} optional styles={styles} c={c} />
        <Field label={t("profile.edit.end_date")} value={form.end} onChangeText={set('end')} placeholder={t("profile.edit.end_date_placeholder")} optional styles={styles} c={c} />
        <Field label={t("profile.edit.description")} value={form.description} onChangeText={set('description')} placeholder={t("profile.edit.volunteering_placeholder")} multiline optional styles={styles} c={c} />
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={c.white} size="small" /> : <Text style={styles.saveBtnText}>{isEdit ? t("profile.save_changes") : t("profile.add_volunteering")}</Text>}
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
  input: { fontFamily: FONT_FAMILY, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: c.foreground },
  inputMulti: { minHeight: 120, paddingTop: 12 },
  saveBtn: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { fontFamily: FONT_FAMILY_BOLD, color: c.white, fontSize: 15 },
  });
}
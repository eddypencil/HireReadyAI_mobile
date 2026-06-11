// features/applicant/screens/edit/EditExperienceScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { addExperience, updateExperience } from '../../services/experience.service';
import { Experience } from '../../models';

function Field({ label, value, onChangeText, placeholder, multiline, optional, keyboardType }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}
        {optional && <Text style={styles.optional}> (optional)</Text>}
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
    if (!form.title.trim()) { Alert.alert('Required', 'Job title is required.'); return; }
    if (!form.companyName.trim()) { Alert.alert('Required', 'Company name is required.'); return; }
    if (!form.from.trim()) { Alert.alert('Required', 'Start date is required.'); return; }

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
      Alert.alert('Error', 'Could not save experience. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Field label="Job Title" value={form.title} onChangeText={set('title')} placeholder="e.g. Frontend Developer" />
        <Field label="Company Name" value={form.companyName} onChangeText={set('companyName')} placeholder="e.g. Vodafone Egypt" />
        <Field label="Industry" value={form.industry} onChangeText={set('industry')} placeholder="e.g. Telecommunications" optional />
        <Field label="From" value={form.from} onChangeText={set('from')} placeholder="YYYY-MM  e.g. 2023-06" />
        <Field label="To" value={form.to} onChangeText={set('to')} placeholder="YYYY-MM  or 'Present'" optional />
        <Field label="Description" value={form.description} onChangeText={set('description')} placeholder="Describe your responsibilities and achievements..." multiline optional />

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave} disabled={saving} activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={c.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Experience'}</Text>}
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
  label: { fontSize: 12, fontWeight: '600', color: c.foreground, textTransform: 'uppercase', letterSpacing: 0.4 },
  optional: { fontWeight: '400', color: c['muted-foreground'], textTransform: 'none' },
  input: {
    backgroundColor: c.white, borderWidth: 1, borderColor: c.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: c.foreground,
  },
  inputMulti: { minHeight: 120, paddingTop: 12 },
  saveBtn: {
    backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
    shadowColor: c.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: c.white, fontSize: 15, fontWeight: '700' },
  });
}
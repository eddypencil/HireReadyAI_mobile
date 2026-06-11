// features/applicant/screens/edit/EditEducationScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../../../src/theme';
import { addEducation, updateEducation } from '../../services/education.service';
import { Education } from '../../models';

const LEVELS = ['High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Other'];

function Field({ label, value, onChangeText, placeholder, multiline, optional }) {
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
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        autoCapitalize="sentences"
      />
    </View>
  );
}

export default function EditEducationScreen() {
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
    if (!form.university.trim()) { Alert.alert('Required', 'University / School name is required.'); return; }
    if (!form.startYear.trim()) { Alert.alert('Required', 'Start year is required.'); return; }

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
      Alert.alert('Error', 'Could not save education. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Degree level picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Degree Level <Text style={styles.optional}>(optional)</Text></Text>
          <View style={styles.levelRow}>
            {LEVELS.map(l => (
              <TouchableOpacity
                key={l}
                style={[styles.levelPill, form.level === l && styles.levelPillActive]}
                onPress={() => set('level')(l)}
                activeOpacity={0.75}
              >
                <Text style={[styles.levelPillText, form.level === l && styles.levelPillTextActive]}>
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Field label="University / School" value={form.university} onChangeText={set('university')} placeholder="e.g. Cairo University" />
        <Field label="Faculty" value={form.faculty} onChangeText={set('faculty')} placeholder="e.g. Faculty of Engineering" optional />
        <Field label="Major / Field of Study" value={form.major} onChangeText={set('major')} placeholder="e.g. Systems & Biomedical Engineering" optional />
        <Field label="Start Year" value={form.startYear} onChangeText={set('startYear')} placeholder="e.g. 2020" />
        <Field label="End Year" value={form.endYear} onChangeText={set('endYear')} placeholder="e.g. 2024  (leave blank if ongoing)" optional />
        <Field label="Grade / GPA" value={form.grade} onChangeText={set('grade')} placeholder="e.g. 3.8 / 4.0 or Excellent" optional />

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave} disabled={saving} activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Education'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 12, fontWeight: '600', color: colors.foreground, textTransform: 'uppercase', letterSpacing: 0.4 },
  optional: { fontWeight: '400', color: colors.mutedForeground, textTransform: 'none' },
  input: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.foreground,
  },
  inputMulti: { minHeight: 120, paddingTop: 12 },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelPill: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.white,
  },
  levelPillActive: { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
  levelPillText: { fontSize: 13, fontWeight: '500', color: colors.mutedForeground },
  levelPillTextActive: { color: colors.primary, fontWeight: '700' },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
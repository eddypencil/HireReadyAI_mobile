// features/applicant/screens/edit/EditVolunteeringScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { addVolunteering, updateVolunteering } from '../../services/volunteering.service';
import { Volunteering } from '../../models';

function Field({ label, value, onChangeText, placeholder, multiline, optional, styles, c }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}{optional && <Text style={styles.optional}> (optional)</Text>}
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
    if (!form.role.trim()) { Alert.alert('Required', 'Role is required.'); return; }
    if (!form.organization.trim()) { Alert.alert('Required', 'Organization is required.'); return; }
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
      Alert.alert('Error', 'Could not save volunteering.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Role" value={form.role} onChangeText={set('role')} placeholder="e.g. Mentor" styles={styles} c={c} />
        <Field label="Organization" value={form.organization} onChangeText={set('organization')} placeholder="e.g. Egyptian Food Bank" styles={styles} c={c} />
        <Field label="Start Date" value={form.start} onChangeText={set('start')} placeholder="YYYY-MM  e.g. 2022-03" optional styles={styles} c={c} />
        <Field label="End Date" value={form.end} onChangeText={set('end')} placeholder="YYYY-MM  or leave blank if ongoing" optional styles={styles} c={c} />
        <Field label="Description" value={form.description} onChangeText={set('description')} placeholder="What did you do?" multiline optional styles={styles} c={c} />
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={c.white} size="small" /> : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Volunteering'}</Text>}
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
  input: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: c.foreground },
  inputMulti: { minHeight: 120, paddingTop: 12 },
  saveBtn: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: c.white, fontSize: 15, fontWeight: '700' },
  });
}
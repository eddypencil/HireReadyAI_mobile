// features/applicant/screens/edit/EditAwardsScreen.js
// Awards don't have a model class — stored as plain objects
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../../../src/theme';
import { supabase } from '../../../../shared/services/supabase';

async function getAwards(userId) {
  const { data, error } = await supabase
    .from('profiles').select('awards').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data?.awards || [];
}

async function saveAwards(userId, awards) {
  const { error } = await supabase
    .from('profiles').update({ awards }).eq('id', userId);
  if (error) throw error;
}

function Field({ label, value, onChangeText, placeholder, multiline, optional }) {
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
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        autoCapitalize="sentences"
      />
    </View>
  );
}

export default function EditAwardsScreen() {
  const navigation = useNavigation();
  const { profileId, item, itemIndex } = useRoute().params || {};
  const isEdit = item != null && itemIndex != null;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title:       item?.title       || '',
    issuer:      item?.issuer      || '',
    year:        item?.year        || '',
    description: item?.description || '',
  });

  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { Alert.alert('Required', 'Award title is required.'); return; }
    setSaving(true);
    try {
      const current = await getAwards(profileId);
      const awardObj = {
        title:       form.title.trim(),
        issuer:      form.issuer.trim(),
        year:        form.year.trim(),
        description: form.description.trim(),
      };
      if (isEdit) {
        current[itemIndex] = awardObj;
      } else {
        current.push(awardObj);
      }
      await saveAwards(profileId, current);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save award.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Award Title" value={form.title} onChangeText={set('title')} placeholder="e.g. Best Graduation Project" />
        <Field label="Issuer / Organization" value={form.issuer} onChangeText={set('issuer')} placeholder="e.g. ITI" optional />
        <Field label="Year" value={form.year} onChangeText={set('year')} placeholder="e.g. 2024" optional />
        <Field label="Description" value={form.description} onChangeText={set('description')} placeholder="Brief description of the award..." multiline optional />
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Award'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: colors.foreground, textTransform: 'uppercase', letterSpacing: 0.4 },
  optional: { fontWeight: '400', color: colors.mutedForeground, textTransform: 'none' },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.foreground },
  inputMulti: { minHeight: 100, paddingTop: 12 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
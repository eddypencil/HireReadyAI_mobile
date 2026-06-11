// features/applicant/screens/edit/EditLinksScreen.js
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { fetchApplicantProfile, updateApplicantProfile } from '../../services/profile.service';

export default function EditLinksScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  const navigation = useNavigation();
  const { profileId } = useRoute().params || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');

  useEffect(() => {
    fetchApplicantProfile(profileId)
      .then(data => {
        setLinkedinUrl(data?.linkedin_url || '');
      })
      .catch(() => Alert.alert('Error', 'Could not load profile.'))
      .finally(() => setLoading(false));
  }, [profileId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateApplicantProfile(profileId, {
        linkedin_url: linkedinUrl.trim() || null,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color={c.primary} /></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <View style={[styles.labelIcon, { backgroundColor: `${c.accent}18` }]}>
              <Ionicons name="logo-linkedin" size={14} color={c.accent} />
            </View>
            <View>
              <Text style={styles.label}>LinkedIn URL</Text>
              <Text style={styles.hint}>Your LinkedIn profile link</Text>
            </View>
          </View>
          <TextInput
            style={styles.input}
            value={linkedinUrl}
            onChangeText={setLinkedinUrl}
            placeholder="https://linkedin.com/in/username"
            placeholderTextColor={c['muted-foreground']}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={c.white} size="small" />
            : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
  scroll: { flex: 1, backgroundColor: c.surface },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fieldGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  labelIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  label: { fontSize: 13, fontWeight: '700', color: c.foreground },
  hint: { fontSize: 12, color: c['muted-foreground'] },
  input: {
    backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: c.foreground,
  },
  saveBtn: {
    backgroundColor: c.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
    shadowColor: c.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: c.white, fontSize: 15, fontWeight: '700' },
  });
}
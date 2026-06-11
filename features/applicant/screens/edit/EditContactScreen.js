// features/applicant/screens/edit/EditContactScreen.js
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../../../src/theme';
import { fetchApplicantProfile, updateApplicantProfile } from '../../services/profile.service';

export default function EditContactScreen() {
  const navigation = useNavigation();
  const { profileId } = useRoute().params || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchApplicantProfile(profileId)
      .then(data => {
        setPhone(data?.phone || '');
        setLocation(data?.location || '');
      })
      .catch(() => Alert.alert('Error', 'Could not load profile.'))
      .finally(() => setLoading(false));
  }, [profileId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateApplicantProfile(profileId, {
        phone: phone.trim() || null,
        location: location.trim() || null,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <View style={[styles.labelIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="call-outline" size={14} color="#2563eb" />
            </View>
            <Text style={styles.label}>Phone Number</Text>
          </View>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+20 1XX XXXX XXX"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <View style={[styles.labelIcon, { backgroundColor: '#fce7f3' }]}>
              <Ionicons name="location-outline" size={14} color="#db2777" />
            </View>
            <Text style={styles.label}>Location</Text>
          </View>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Cairo, Egypt"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fieldGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  labelIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  input: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.foreground,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
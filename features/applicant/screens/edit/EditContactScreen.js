// features/applicant/screens/edit/EditContactScreen.js
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useThemedAlert } from '../../../../shared/context/ThemedAlertContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { fetchApplicantProfile, updateApplicantProfile } from '../../services/profile.service';


export default function EditContactScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { alert } = useThemedAlert();
  const c = theme.colors;
  const styles = createStyles(c);
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
      .catch(() => alert(t("profile.error_title"), t("profile.error_load")))
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
      alert(t("profile.error_title"), t("profile.error_save"));
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
              <Ionicons name="call-outline" size={14} color={c.accent} />
            </View>
            <Text style={styles.label}>{t("profile.fields.phone")}</Text>
          </View>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+20 1XX XXXX XXX"
            placeholderTextColor={c['muted-foreground']}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <View style={[styles.labelIcon, { backgroundColor: `${c.primary}18` }]}>
              <Ionicons name="location-outline" size={14} color={c.primary} />
            </View>
            <Text style={styles.label}>{t("profile.fields.location")}</Text>
          </View>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Cairo, Egypt"
            placeholderTextColor={c['muted-foreground']}
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
            ? <ActivityIndicator color={c.white} size="small" />
            : <Text style={styles.saveBtnText}>{t("profile.save_changes")}</Text>}
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
  labelIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '700', fontSize: 13, color: c.foreground },
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
  saveBtnText: { fontWeight: '700', color: c.white, fontSize: 15 },
  });
}
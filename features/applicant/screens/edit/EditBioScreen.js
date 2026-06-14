// features/applicant/screens/edit/EditBioScreen.js
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useThemedAlert } from '../../../../shared/context/ThemedAlertContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { fetchApplicantProfile, updateApplicantProfile } from '../../services/profile.service';


export default function EditBioScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { alert } = useThemedAlert();
  const c = theme.colors;
  const styles = createStyles(c);
  const navigation = useNavigation();
  const { profileId } = useRoute().params || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetchApplicantProfile(profileId)
      .then(data => {
        setHeadline(data?.headline || '');
        setBio(data?.bio || '');
      })
      .catch(() => alert(t("profile.error_title"), t("profile.error_load")))
      .finally(() => setLoading(false));
  }, [profileId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateApplicantProfile(profileId, {
        headline: headline.trim() || null,
        bio: bio.trim() || null,
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
          <Text style={styles.label}>{t("profile.fields.headline")}</Text>
          <Text style={styles.hint}>{t("profile.edit.headline_hint")}</Text>
          <TextInput
            style={styles.input}
            value={headline}
            onChangeText={setHeadline}
            placeholder="e.g. Frontend Developer at Vodafone"
            placeholderTextColor={c['muted-foreground']}
            autoCapitalize="sentences"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("profile.fields.bio")}</Text>
          <Text style={styles.hint}>{t("profile.edit.bio_hint")}</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={bio}
            onChangeText={setBio}
            placeholder="e.g. I'm a frontend developer with 2 years of experience building cross-platform apps..."
            placeholderTextColor={c['muted-foreground']}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            autoCapitalize="sentences"
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
  fieldGroup: { gap: 6 },
  label: { fontWeight: '700', fontSize: 13, color: c.foreground },
  hint: { fontSize: 12, color: c['muted-foreground'], lineHeight: 17 },
  input: {
    backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: c.foreground,
  },
  inputMulti: { minHeight: 130, paddingTop: 12 },
  saveBtn: {
    backgroundColor: c.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
    shadowColor: c.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { fontWeight: '700', color: c.white, fontSize: 15 },
  });
}
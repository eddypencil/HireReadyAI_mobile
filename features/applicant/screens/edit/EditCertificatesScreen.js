// features/applicant/screens/edit/EditCertificatesScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useThemedAlert } from '../../../../shared/context/ThemedAlertContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { addCertificate, updateCertificate } from '../../services/certificates.service';
import { Certificate } from '../../models';
import { supabase } from '../../../../shared/services/supabase';


// -- Upload to certificates bucket using base64
async function uploadCertificateImage(userId, fileUri) {
  const ext = fileUri.split('.').pop()?.split('?')[0] || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const base64 = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.responseType = 'blob';
    xhr.open('GET', fileUri, true);
    xhr.send(null);
  });

  const { error } = await supabase.storage
    .from('certificates')
    .upload(path, decode(base64), { upsert: false, contentType: `image/${ext}` });
  if (error) throw error;

  const { data } = supabase.storage.from('certificates').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

async function deleteCertificateImage(url) {
  const parts = url.split('/certificates/');
  if (parts.length < 2) return;
  const path = parts[1].split('?')[0];
  await supabase.storage.from('certificates').remove([path]);
}

function Field({ label, value, onChangeText, placeholder, optional, keyboardType }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}{optional && <Text style={styles.optional}> {t("companies.optional")}</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c['muted-foreground']}
        autoCapitalize="sentences"
        autoCorrect={false}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

export default function EditCertificatesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { alert } = useThemedAlert();
  const c = theme.colors;
  const styles = createStyles(c);
  const navigation = useNavigation();
  const { profileId, item, itemIndex } = useRoute().params || {};
  const isEdit = item != null && itemIndex != null;

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(item?.image || null);

  const [form, setForm] = useState({
    name:         item?.name         || '',
    organization: item?.organization || '',
    field:        item?.field        || '',
    date:         item?.date         || '',
  });

  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert(t("profile.edit.permission_title"), t("profile.edit.permission_gallery"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });

    if (!result || result.canceled) return;
    const file = result.assets?.[0] ?? result;
    if (!file?.uri) return;

    setUploadingImage(true);
    try {
      const url = await uploadCertificateImage(profileId, file.uri);
      setImageUrl(url);
    } catch (err) {
      alert(t("profile.error_title"), err?.message || t("profile.edit.error_save"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    alert(t("profile.edit.remove_title"), t("profile.edit.remove_confirm_certificate"), [
      { text: t("profile.edit.cancel"), style: 'cancel' },
      {
        text: t("profile.edit.remove"), style: 'destructive',
        onPress: async () => {
          if (imageUrl) {
            try { await deleteCertificateImage(imageUrl); } catch {}
          }
          setImageUrl(null);
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert(t("profile.error_title"), t("profile.edit.error_certificate_name"));
      return;
    }
    setSaving(true);
    try {
      const cert = new Certificate({
        name:         form.name.trim(),
        organization: form.organization.trim(),
        field:        form.field.trim(),
        date:         form.date.trim(),
        image:        imageUrl || null,
      });
      if (isEdit) {
        await updateCertificate(profileId, itemIndex, cert.toJson());
      } else {
        await addCertificate(profileId, cert.toJson());
      }
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

        <Field label={t("profile.edit.certificate_name")} value={form.name} onChangeText={set('name')} placeholder="e.g. AWS Certified Developer" />
        <Field label={t("profile.edit.issuing_org")} value={form.organization} onChangeText={set('organization')} placeholder="e.g. Amazon Web Services" optional />
        <Field label={t("profile.edit.field_subject")} value={form.field} onChangeText={set('field')} placeholder="e.g. Cloud Computing" optional />
        <Field label={t("profile.edit.date")} value={form.date} onChangeText={set('date')} placeholder="e.g. 2024-03 or March 2024" optional />

        {/* Image section */}
        <View style={styles.divider} />
        <View style={styles.imageSectionHeader}>
          <Ionicons name="image-outline" size={18} color={c.accent} />
          <View>
            <Text style={styles.imageSectionTitle}>{t("profile.edit.certificate_image")}</Text>
            <Text style={styles.imageSectionSubtitle}>{t("profile.edit.cert_image_hint")}</Text>
          </View>
        </View>

        {imageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
            <TouchableOpacity style={styles.removeImageBtn} onPress={handleRemoveImage} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={16} color={c.white} />
              <Text style={styles.removeImageText}>{t("profile.edit.remove_image")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addImageBtn, uploadingImage && { opacity: 0.6 }]}
            onPress={handlePickImage}
            disabled={uploadingImage}
            activeOpacity={0.75}
          >
            {uploadingImage
              ? <ActivityIndicator size="small" color={c.accent} />
              : <Ionicons name="cloud-upload-outline" size={20} color={c.accent} />}
            <Text style={styles.addImageBtnText}>
              {uploadingImage ? t("profile.edit.uploading") : t("profile.edit.upload_cert_image")}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={c.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? t("profile.save_changes") : t("profile.edit.add_certificate")}</Text>}
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
  label: { fontSize: 12, color: c.foreground, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: '600' },
  optional: { fontWeight: '400', color: c['muted-foreground'], textTransform: 'none' },
  input: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: c.foreground },
  divider: { height: 1, backgroundColor: c.border },
  imageSectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  imageSectionTitle: { fontWeight: '700', fontSize: 15, color: c.foreground },
  imageSectionSubtitle: { fontSize: 12, color: c['muted-foreground'], marginTop: 2 },
  imagePreviewContainer: { gap: 10 },
  imagePreview: { width: '100%', height: 200, borderRadius: 14, borderWidth: 1, borderColor: c.border },
  removeImageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ef4444', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start',
  },
  removeImageText: { color: c.white, fontSize: 13, fontWeight: '600' },
  addImageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: `${c.accent}50`,
    borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 16,
    backgroundColor: `${c.accent}08`,
  },
  addImageBtnText: { fontWeight: '600', fontSize: 14, color: c.accent },
  saveBtn: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4, shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: c.white, fontSize: 15, fontWeight: '700' },
  });
}
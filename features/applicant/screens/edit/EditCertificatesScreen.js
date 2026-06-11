// features/applicant/screens/edit/EditCertificatesScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { colors } from '../../../../src/theme';
import { addCertificate, updateCertificate } from '../../services/certificates.service';
import { Certificate } from '../../models';
import { supabase } from '../../../../shared/services/supabase';

// ── Upload to certificates bucket using base64
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
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}{optional && <Text style={styles.optional}> (optional)</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        autoCapitalize="sentences"
        autoCorrect={false}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

export default function EditCertificatesScreen() {
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
    url:          item?.url          || '',
  });

  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need gallery access to upload the certificate image.');
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
      Alert.alert('Upload Failed', err?.message || 'Could not upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert('Remove Image', 'Remove the certificate image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
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
      Alert.alert('Required', 'Certificate name is required.');
      return;
    }
    setSaving(true);
    try {
      const cert = new Certificate({
        name:         form.name.trim(),
        organization: form.organization.trim(),
        field:        form.field.trim(),
        date:         form.date.trim(),
        url:          form.url.trim(),
        image:        imageUrl || null,
      });
      if (isEdit) {
        await updateCertificate(profileId, itemIndex, cert.toJson());
      } else {
        await addCertificate(profileId, cert.toJson());
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save certificate.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Field label="Certificate Name" value={form.name} onChangeText={set('name')} placeholder="e.g. AWS Certified Developer" />
        <Field label="Issuing Organization" value={form.organization} onChangeText={set('organization')} placeholder="e.g. Amazon Web Services" optional />
        <Field label="Field / Subject" value={form.field} onChangeText={set('field')} placeholder="e.g. Cloud Computing" optional />
        <Field label="Date" value={form.date} onChangeText={set('date')} placeholder="e.g. 2024-03 or March 2024" optional />
        <Field label="Certificate URL" value={form.url} onChangeText={set('url')} placeholder="https://credential.link..." optional keyboardType="url" />

        {/* Image section */}
        <View style={styles.divider} />
        <View style={styles.imageSectionHeader}>
          <Ionicons name="image-outline" size={18} color={colors.accent} />
          <View>
            <Text style={styles.imageSectionTitle}>Certificate Image</Text>
            <Text style={styles.imageSectionSubtitle}>Upload a photo of your certificate</Text>
          </View>
        </View>

        {imageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
            <TouchableOpacity style={styles.removeImageBtn} onPress={handleRemoveImage} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={16} color={colors.white} />
              <Text style={styles.removeImageText}>Remove Image</Text>
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
              ? <ActivityIndicator size="small" color={colors.accent} />
              : <Ionicons name="cloud-upload-outline" size={20} color={colors.accent} />}
            <Text style={styles.addImageBtnText}>
              {uploadingImage ? 'Uploading...' : 'Upload Certificate Image'}
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
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Certificate'}</Text>}
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
  divider: { height: 1, backgroundColor: colors.border },
  imageSectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  imageSectionTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  imageSectionSubtitle: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  imagePreviewContainer: { gap: 10 },
  imagePreview: { width: '100%', height: 200, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  removeImageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ef4444', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start',
  },
  removeImageText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  addImageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: `${colors.accent}50`,
    borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 16,
    backgroundColor: `${colors.accent}08`,
  },
  addImageBtnText: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
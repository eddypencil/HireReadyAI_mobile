// features/applicant/screens/edit/EditProjectScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { addProject, updateProject } from '../../services/projects.service';
import { Project } from '../../models';
import { supabase } from '../../../../shared/services/supabase';
import { FONT_FAMILY, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from '../../../../src/fonts';

function Field({ label, value, onChangeText, placeholder, multiline, optional, keyboardType, styles, c }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}
        {optional && <Text style={styles.optional}> {t("companies.optional")}</Text>}
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
        autoCorrect={false}
      />
    </View>
  );
}

// ── Upload using base64 to avoid Android "network request failed"
async function uploadImage(profileId, fileUri) {
  const ext = fileUri.split('.').pop()?.split('?')[0] || 'jpg';
  const path = `${profileId}/projects/${Date.now()}.${ext}`;

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
    .from('project-media')
    .upload(path, decode(base64), { upsert: false, contentType: `image/${ext}` });
  if (error) throw error;

  const { data } = supabase.storage.from('project-media').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

async function deleteImage(url) {
  const parts = url.split('/project-media/');
  if (parts.length < 2) return;
  const path = parts[1].split('?')[0]; // strip cache-busting param
  await supabase.storage.from('project-media').remove([path]);
}

export default function EditProjectScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const navigation = useNavigation();
  const route = useRoute();
  const { profileId, item, itemIndex } = route.params || {};
  const isEdit = item != null && itemIndex != null;

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name:         item?.name         || '',
    description:  item?.description  || '',
    technologies: item?.technologies?.join(', ') || '',
    url:          item?.url          || '',
  });

  const [images, setImages] = useState(item?.images || []);

  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t("profile.edit.permission_title"), t("profile.edit.permission_gallery_screenshots"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result || result.canceled) return;
    const file = result.assets?.[0] ?? result;
    if (!file?.uri) return;

    setUploadingImage(true);
    try {
      const url = await uploadImage(profileId, file.uri);
      setImages(prev => [...prev, url]);
    } catch (err) {
      Alert.alert(t("profile.error_title"), err?.message || t("profile.edit.error_save"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    Alert.alert(t("profile.edit.remove_title"), t("profile.edit.remove_confirm_screenshot"), [
      { text: t("profile.edit.cancel"), style: 'cancel' },
      {
        text: t("profile.edit.remove"), style: 'destructive',
        onPress: async () => {
          try { await deleteImage(images[index]); } catch {}
          setImages(prev => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert(t("profile.error_title"), t("profile.edit.error_project_name"));
      return;
    }
    setSaving(true);
    try {
      const technologies = form.technologies
        .split(',').map(t => t.trim()).filter(Boolean);

      const project = new Project({
        name:        form.name.trim(),
        description: form.description.trim(),
        technologies,
        images,
        url:         form.url.trim(),
      });

      const projectJson = project.toJson();

      if (isEdit) {
        await updateProject(profileId, itemIndex, projectJson);
      } else {
        await addProject(profileId, projectJson);
      }

      navigation.goBack();
    } catch {
      Alert.alert(t("profile.error_title"), t("profile.edit.error_save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Field label={t("profile.edit.project_name")} value={form.name} onChangeText={set('name')} placeholder={t("profile.edit.project_name_placeholder")} styles={styles} c={c} />
        <Field label={t("profile.edit.description")} value={form.description} onChangeText={set('description')} placeholder={t("profile.edit.description_placeholder_alt")} multiline optional styles={styles} c={c} />
        <Field label={t("profile.edit.technologies")} value={form.technologies} onChangeText={set('technologies')} placeholder={t("profile.edit.technologies_placeholder")} optional styles={styles} c={c} />
        <Field label={t("profile.edit.project_url")} value={form.url} onChangeText={set('url')} placeholder={t("profile.edit.project_url_placeholder")} optional keyboardType="url" styles={styles} c={c} />

        {/* Screenshots */}
        <View style={styles.divider} />
        <View style={styles.mediaSectionHeader}>
          <Ionicons name="images-outline" size={18} color={c.accent} />
          <View>
            <Text style={styles.mediaSectionTitle}>{t("profile.edit.screenshots")}</Text>
            <Text style={styles.mediaSectionSubtitle}>{t("profile.edit.screenshots_subtitle")}</Text>
          </View>
        </View>

        {images.length > 0 && (
          <View style={styles.imagesGrid}>
            {images.map((url, i) => (
              <View key={i} style={styles.imageTile}>
                <Image source={{ uri: url }} style={styles.imageTileImg} resizeMode="cover" />
                <TouchableOpacity style={styles.imageRemoveBtn} onPress={() => handleRemoveImage(i)}>
                  <Ionicons name="close-circle" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.addImageBtn, uploadingImage && { opacity: 0.6 }]}
          onPress={handlePickImage}
          disabled={uploadingImage}
          activeOpacity={0.75}
        >
          {uploadingImage
            ? <ActivityIndicator size="small" color={c.accent} />
            : <Ionicons name="image-outline" size={18} color={c.accent} />}
          <Text style={styles.addImageBtnText}>
            {uploadingImage ? t("profile.edit.uploading") : t("profile.edit.upload_screenshot")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave} disabled={saving} activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={c.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? t("profile.save_changes") : t("profile.projects_tab.add_project")}</Text>}
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
  label: { fontFamily: FONT_FAMILY_SEMIBOLD, fontSize: 12, color: c.foreground, textTransform: 'uppercase', letterSpacing: 0.4 },
  optional: { fontFamily: FONT_FAMILY, fontWeight: '400', color: c['muted-foreground'], textTransform: 'none' },
  input: {
    fontFamily: FONT_FAMILY, backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: c.foreground,
  },
  inputMulti: { minHeight: 120, paddingTop: 12 },
  divider: { height: 1, backgroundColor: c.border },
  mediaSectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mediaSectionTitle: { fontFamily: FONT_FAMILY_BOLD, fontSize: 15, color: c.foreground },
  mediaSectionSubtitle: { fontFamily: FONT_FAMILY, fontSize: 12, color: c['muted-foreground'], marginTop: 2 },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageTile: { width: '47%', aspectRatio: 16 / 10, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  imageTileImg: { width: '100%', height: '100%' },
  imageRemoveBtn: { position: 'absolute', top: 4, right: 4 },
  addImageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: `${c.accent}50`,
    borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: `${c.accent}08`,
  },
  addImageBtnText: { fontFamily: FONT_FAMILY_SEMIBOLD, fontSize: 14, color: c.accent },
  saveBtn: {
    backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
    shadowColor: c.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { fontFamily: FONT_FAMILY_BOLD, color: c.white, fontSize: 15 },
  });
}
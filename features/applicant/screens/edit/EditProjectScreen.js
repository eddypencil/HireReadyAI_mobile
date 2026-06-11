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
import { colors } from '../../../../src/theme';
import { addProject, updateProject } from '../../services/projects.service';
import { Project } from '../../models';
import { supabase } from '../../../../shared/services/supabase';

function Field({ label, value, onChangeText, placeholder, multiline, optional, keyboardType }) {
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
  const [videoLinks, setVideoLinks] = useState(item?.videoLinks || []);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');

  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need gallery access to upload screenshots.');
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
      Alert.alert('Upload Failed', err?.message || 'Could not upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    Alert.alert('Remove', 'Remove this screenshot?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try { await deleteImage(images[index]); } catch {}
          setImages(prev => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;
    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const isVimeo = videoUrl.includes('vimeo.com');
    if (!isYoutube && !isVimeo) {
      Alert.alert('Invalid URL', 'Please enter a valid YouTube or Vimeo link.');
      return;
    }
    setVideoLinks(prev => [...prev, { url: videoUrl.trim(), caption: videoCaption.trim() }]);
    setVideoUrl('');
    setVideoCaption('');
  };

  const handleRemoveVideo = (index) => {
    setVideoLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Project name is required.');
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

      const projectJson = { ...project.toJson(), videoLinks };

      if (isEdit) {
        await updateProject(profileId, itemIndex, projectJson);
      } else {
        await addProject(profileId, projectJson);
      }

      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  function getYoutubeThumbnail(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Field label="Project Name" value={form.name} onChangeText={set('name')} placeholder="e.g. HireReadyAI Mobile App" />
        <Field label="Description" value={form.description} onChangeText={set('description')} placeholder="What does this project do and what problem does it solve?" multiline optional />
        <Field label="Technologies Used" value={form.technologies} onChangeText={set('technologies')} placeholder="React Native, Supabase, Expo  (comma separated)" optional />
        <Field label="Project URL" value={form.url} onChangeText={set('url')} placeholder="https://github.com/... or live link" optional keyboardType="url" />

        {/* Screenshots */}
        <View style={styles.divider} />
        <View style={styles.mediaSectionHeader}>
          <Ionicons name="images-outline" size={18} color={colors.accent} />
          <View>
            <Text style={styles.mediaSectionTitle}>Screenshots</Text>
            <Text style={styles.mediaSectionSubtitle}>Images are uploaded to cloud storage</Text>
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
            ? <ActivityIndicator size="small" color={colors.accent} />
            : <Ionicons name="image-outline" size={18} color={colors.accent} />}
          <Text style={styles.addImageBtnText}>
            {uploadingImage ? 'Uploading...' : 'Add Screenshot from Gallery'}
          </Text>
        </TouchableOpacity>

        {/* Video links */}
        <View style={styles.divider} />
        <View style={styles.mediaSectionHeader}>
          <Ionicons name="videocam-outline" size={18} color={colors.accent} />
          <View>
            <Text style={styles.mediaSectionTitle}>Video Links</Text>
            <Text style={styles.mediaSectionSubtitle}>Paste a YouTube or Vimeo link</Text>
          </View>
        </View>

        {videoLinks.length > 0 && (
          <View style={styles.videoList}>
            {videoLinks.map((v, i) => {
              const thumb = getYoutubeThumbnail(v.url);
              return (
                <View key={i} style={styles.videoItem}>
                  {thumb
                    ? <Image source={{ uri: thumb }} style={styles.videoThumb} resizeMode="cover" />
                    : <View style={[styles.videoThumb, styles.videoThumbPlaceholder]}>
                        <Ionicons name="logo-youtube" size={20} color="#ff0000" />
                      </View>}
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoUrl} numberOfLines={1}>{v.url}</Text>
                    {v.caption ? <Text style={styles.videoCaption}>{v.caption}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveVideo(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.videoInputGroup}>
          <TextInput
            style={styles.input}
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <TextInput
            style={styles.input}
            value={videoCaption}
            onChangeText={setVideoCaption}
            placeholder="Caption (optional)"
            placeholderTextColor={colors.mutedForeground}
          />
          <TouchableOpacity style={styles.addVideoBtn} onPress={handleAddVideo} activeOpacity={0.75}>
            <Ionicons name="add-circle-outline" size={16} color={colors.white} />
            <Text style={styles.addVideoBtnText}>Add Video Link</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave} disabled={saving} activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Project'}</Text>}
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
  input: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.foreground,
  },
  inputMulti: { minHeight: 120, paddingTop: 12 },
  divider: { height: 1, backgroundColor: colors.border },
  mediaSectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mediaSectionTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  mediaSectionSubtitle: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageTile: { width: '47%', aspectRatio: 16 / 10, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  imageTileImg: { width: '100%', height: '100%' },
  imageRemoveBtn: { position: 'absolute', top: 4, right: 4 },
  addImageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: `${colors.accent}50`,
    borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: `${colors.accent}08`,
  },
  addImageBtnText: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  videoList: { gap: 10 },
  videoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, padding: 10,
  },
  videoThumb: { width: 60, height: 42, borderRadius: 8 },
  videoThumbPlaceholder: { backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  videoInfo: { flex: 1 },
  videoUrl: { fontSize: 12, color: colors.accent },
  videoCaption: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  videoInputGroup: { gap: 10 },
  addVideoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.accent, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start',
  },
  addVideoBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
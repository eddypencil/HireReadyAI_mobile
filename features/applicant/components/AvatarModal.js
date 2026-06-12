// features/applicant/components/AvatarModal.js
import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from "../../../shared/services/supabase";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { FONT_FAMILY_BOLD, FONT_FAMILY_SEMIBOLD } from '../../../src/fonts';

export default function AvatarModal({ open, onClose, userId, currentUrl, onUpdated, onDeleted }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("applicant.permission_needed"), t("applicant.permission_message"));
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

      setUploading(true);

      const ext = file.uri.split(".").pop()?.split("?")[0] || "jpg";
      const filePath = `avatars/${userId}.${ext}`;

      // ── Use base64 instead of fetch() to avoid Android network request failed
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
      xhr.open('GET', file.uri, true);
      xhr.send(null);
    });

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(base64), { upsert: true, contentType: `image/${ext}` });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      urlData.publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_pic: urlData.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      onUpdated?.(urlData.publicUrl);
      onClose();
    } catch (err) {
      Alert.alert(t("applicant.error_title"), t("applicant.update_error"));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setUploading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ profile_pic: null })
        .eq("id", userId);
      if (error) throw error;
      onDeleted?.();
      onClose();
    } catch (err) {
      Alert.alert(t("applicant.error_title"), t("applicant.remove_error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: `${c.sidebar}66`,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{
          backgroundColor: c.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: c.border,
          padding: 24,
          width: "100%",
          maxWidth: 340,
        }}>
          <Text style={{
            fontSize: 18,
            color: c.foreground,
            marginBottom: 20,
            fontFamily: FONT_FAMILY_BOLD,
          }}>
            {t("applicant.profile_picture")}
          </Text>

          <View style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={uploading}
              style={{
                backgroundColor: c.primary,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                opacity: uploading ? 0.5 : 1,
              }}
            >
              <Text style={{ color: c['destructive-foreground'], fontSize: 14, fontFamily: FONT_FAMILY_SEMIBOLD }}>
                {uploading ? t("applicant.uploading") : t("applicant.upload_photo")}
              </Text>
            </TouchableOpacity>

            {currentUrl && (
              <TouchableOpacity
                onPress={handleRemove}
                disabled={uploading}
                style={{
                  borderWidth: 1,
                  borderColor: c.red[300],
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: "center",
                  opacity: uploading ? 0.5 : 1,
                }}
              >
                <Text style={{ color: c.red[600], fontSize: 14, fontFamily: FONT_FAMILY_SEMIBOLD }}>
                  Remove Photo
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onClose}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: c['muted-foreground'], fontSize: 14, fontFamily: FONT_FAMILY_SEMIBOLD }}>
                {t("applicant.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

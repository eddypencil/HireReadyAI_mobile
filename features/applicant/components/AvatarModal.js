import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../shared/services/supabase";
import { colors } from "../../../src/theme";

export default function AvatarModal({ open, onClose, userId, currentUrl, onUpdated, onDeleted }) {
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "We need camera roll access to change your avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setUploading(true);
      const file = result.assets[0];

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const ext = file.uri.split(".").pop() || "jpg";
      const filePath = `avatars/${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { upsert: true, contentType: `image/${ext}` });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_pic: urlData.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      onUpdated?.(urlData.publicUrl);
      onClose();
    } catch (err) {
      Alert.alert("Error", "Failed to update avatar. Please try again.");
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
      Alert.alert("Error", "Failed to remove avatar.");
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
          backgroundColor: "rgba(1,42,74,0.4)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{
          backgroundColor: colors.white,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 24,
          width: "100%",
          maxWidth: 340,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: "700",
            color: colors.foreground,
            marginBottom: 20,
          }}>
            Profile Picture
          </Text>

          <View style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={uploading}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                opacity: uploading ? 0.5 : 1,
              }}
            >
              <Text style={{ color: colors.white, fontSize: 14, fontWeight: "600" }}>
                {uploading ? "Uploading..." : "Upload Photo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRemove}
              disabled={uploading}
              style={{
                borderWidth: 1,
                borderColor: colors.red[300],
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                opacity: uploading ? 0.5 : 1,
              }}
            >
              <Text style={{ color: colors.red[600], fontSize: 14, fontWeight: "600" }}>
                Remove Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.mutedForeground, fontSize: 14, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
import { useState } from "react";
import {
  View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { createAdminUser } from "../services/admin.service";

export default function CreateAdminDialog({ visible, onClose }) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await createAdminUser(email.trim(), password, fullName.trim());
      onClose();
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (err) {
      setError(err.message || "Failed to create admin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 }}>
        <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: c.foreground, marginBottom: 16 }}>
            Create Admin
          </Text>

          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
            placeholderTextColor={c["muted-foreground"]}
            style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: c.foreground, marginBottom: 10 }}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={c["muted-foreground"]}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: c.foreground, marginBottom: 10 }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={c["muted-foreground"]}
            secureTextEntry
            style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: c.foreground, marginBottom: 12 }}
          />

          {error ? (
            <Text style={{ fontSize: 11, color: c.destructive, marginBottom: 8 }}>{error}</Text>
          ) : null}

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.muted, justifyContent: "center", alignItems: "center" }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: c["muted-foreground"] }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreate}
              disabled={submitting}
              style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.primary, justifyContent: "center", alignItems: "center", opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>Create</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

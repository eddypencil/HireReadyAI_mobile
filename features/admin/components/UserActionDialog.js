import { useState } from "react";
import {
  View, Text, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

const actions = ["warn", "freeze", "ban", "active"];

export default function UserActionDialog({ visible, onClose, onSubmit, user }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;

  const [actionType, setActionType] = useState("");
  const [reason, setReason] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!actionType) return;
    setSubmitting(true);
    try {
      await onSubmit({
        userId: user?.id,
        actionType,
        reason,
        durationDays: parseInt(durationDays) || 0,
        durationHours: parseInt(durationHours) || 0,
      });
      onClose();
    } catch (err) {
      console.warn("Action failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const label = {
    warn: "Warn",
    freeze: "Freeze",
    ban: "Ban",
    active: "Restore",
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 }}>
        <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: c.foreground, marginBottom: 16 }}>
            User Action — {user?.full_name || "Unknown"}
          </Text>

          <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground, marginBottom: 6 }}>Action Type</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {actions.map((a) => (
              <TouchableOpacity
                key={a}
                onPress={() => setActionType(a)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
                  backgroundColor: actionType === a ? c.primary : c.muted,
                  borderWidth: 1, borderColor: actionType === a ? c.primary : c.border,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: actionType === a ? "#fff" : c["muted-foreground"] }}>
                  {label[a]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {actionType === "closing_warning" && (
            <Text style={{ fontSize: 10, color: c.warning, marginBottom: 8 }}>
              Sets closing_deadline = now + 7 days.
            </Text>
          )}
          {actionType === "ban" && (
            <Text style={{ fontSize: 10, color: c.destructive, marginBottom: 8 }}>
              Immediately bans the user and sets a 7-day appeal deadline.
            </Text>
          )}
          {actionType === "active" && (
            <Text style={{ fontSize: 10, color: c.success, marginBottom: 8 }}>
              Reinstates the user to active status.
            </Text>
          )}

          {actionType === "freeze" && (
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground, marginBottom: 4 }}>Days</Text>
                <TextInput
                  value={durationDays}
                  onChangeText={setDurationDays}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={c["muted-foreground"]}
                  style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: c.foreground }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground, marginBottom: 4 }}>Hours</Text>
                <TextInput
                  value={durationHours}
                  onChangeText={setDurationHours}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={c["muted-foreground"]}
                  style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: c.foreground }}
                />
              </View>
            </View>
          )}

          <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground, marginBottom: 6 }}>Reason</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for this action..."
            placeholderTextColor={c["muted-foreground"]}
            multiline
            numberOfLines={3}
            style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: c.foreground, minHeight: 60, textAlignVertical: "top", marginBottom: 16 }}
          />

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.muted, justifyContent: "center", alignItems: "center" }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: c["muted-foreground"] }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !actionType}
              style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.primary, justifyContent: "center", alignItems: "center", opacity: (submitting || !actionType) ? 0.6 : 1 }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

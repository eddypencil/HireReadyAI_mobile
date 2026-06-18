import { useState } from "react";
import {
  View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";

const actions = [
  { value: "warn", label: "Warn" },
  { value: "closing_warning", label: "Schedule Closure (7 days)" },
  { value: "ban", label: "Ban" },
  { value: "active", label: "Set Active" },
];

const actionHints = {
  warn: { text: "Sends a warning notification to all HR managers. No automatic enforcement.", colorKey: "warning" },
  closing_warning: { text: "Sets closing_deadline = now + 7 days. Company members will see a warning banner.", colorKey: "warning" },
  ban: { text: "Immediately bans the company and closes all active job postings.", colorKey: "destructive" },
  active: { text: "Reinstates the company to active status and clears warning/ban state.", colorKey: "success" },
};

export default function CompanyActionDialog({ visible, onClose, onSubmit, company, initialActionType }) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [actionType, setActionType] = useState(initialActionType || "");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!actionType) return;
    setSubmitting(true);
    try {
      await onSubmit({ actionType, reason });
      onClose();
    } catch (err) {
      console.warn("Company action failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const hint = actionHints[actionType];
  const hintColor = hint ? c[hint.colorKey] : c["muted-foreground"];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 }}>
        <View style={{ backgroundColor: c.card, borderRadius: 20, maxHeight: "80%", overflow: "hidden" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: c.foreground }}>Company Action</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.muted, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 11, color: c["muted-foreground"], lineHeight: 13 }}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 12, color: c["muted-foreground"], marginBottom: 12 }}>
              {company?.name || "Unknown company"}
            </Text>

            <Text style={{ fontSize: 11, fontWeight: "600", color: c.foreground, marginBottom: 6 }}>Action Type</Text>
            <View style={{ gap: 6, marginBottom: 12 }}>
              {actions.map((a) => {
                const selected = actionType === a.value;
                const colorMap = { warn: c.warning, closing_warning: "#ff8c00", ban: c.destructive, active: c.success };
                const ac = colorMap[a.value];
                return (
                  <TouchableOpacity
                    key={a.value}
                    onPress={() => setActionType(a.value)}
                    style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: selected ? `${ac}18` : c.muted, borderWidth: 1, borderColor: selected ? `${ac}40` : c.border }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "600", color: selected ? ac : c["muted-foreground"] }}>{a.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {hint && (
              <Text style={{ fontSize: 10, color: hintColor, lineHeight: 15, marginBottom: 14, paddingHorizontal: 2 }}>
                {hint.text}
              </Text>
            )}

            <Text style={{ fontSize: 11, fontWeight: "600", color: c.foreground, marginBottom: 6 }}>Reason</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Reason for this action..."
              placeholderTextColor={c["muted-foreground"]}
              multiline
              numberOfLines={3}
              style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, color: c.foreground, minHeight: 60, textAlignVertical: "top", marginBottom: 16 }}
            />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={onClose} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.muted, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: c["muted-foreground"] }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} disabled={submitting || !actionType} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.primary, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 6, opacity: (submitting || !actionType) ? 0.6 : 1 }}>
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : null}
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>{submitting ? "Applying..." : "Apply"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

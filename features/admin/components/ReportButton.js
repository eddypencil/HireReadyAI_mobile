import { useState } from "react";
import {
  View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useUser } from "../../auth/context/user.context";
import { submitReport } from "../services/admin.service";

export default function ReportButton({
  reportType,
  targetId,
  targetDetails,
  variant = "icon",
  label = "Report",
}) {
  const { theme } = useTheme();
  const { profile } = useUser();
  const c = theme.colors;

  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!profile) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReport({
        reporterId: profile.id,
        reportType,
        targetId,
        targetDetails,
        subject,
        description,
        severity: "medium",
      });
      setSubmitted(true);
      setSubject("");
      setDescription("");
      setTimeout(() => {
        setSubmitted(false);
        setOpen(false);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  }

  if (!profile) return null;

  return (
    <>
      {variant === "icon" ? (
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={{ padding: 4, borderRadius: 8 }}
        >
          <Ionicons name="flag-outline" size={16} color={c["muted-foreground"]} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: `${c.destructive}10` }}
        >
          <Ionicons name="flag-outline" size={11} color={c.destructive} />
          <Text style={{ fontSize: 10, fontWeight: "600", color: c.destructive }}>{label}</Text>
        </TouchableOpacity>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: c.card, borderRadius: 20, overflow: "hidden" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="flag-outline" size={16} color={c.destructive} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: c.foreground }}>
                  Report {reportType}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setOpen(false)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.muted, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 11, color: c["muted-foreground"], lineHeight: 12 }}>X</Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: c.foreground, marginBottom: 4 }}>Subject</Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Brief title of the issue..."
                placeholderTextColor={c["muted-foreground"]}
                style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, color: c.foreground, marginBottom: 12 }}
              />

              <Text style={{ fontSize: 11, fontWeight: "600", color: c.foreground, marginBottom: 4 }}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the issue in detail..."
                placeholderTextColor={c["muted-foreground"]}
                multiline
                numberOfLines={4}
                style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, color: c.foreground, minHeight: 80, textAlignVertical: "top", marginBottom: 12 }}
              />

              {error && (
                <View style={{ backgroundColor: `${c.destructive}10`, borderRadius: 8, borderWidth: 1, borderColor: `${c.destructive}20`, padding: 10, marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, color: c.destructive }}>{error}</Text>
                </View>
              )}

              {submitted && (
                <View style={{ backgroundColor: `${c.success}10`, borderRadius: 8, borderWidth: 1, borderColor: `${c.success}20`, padding: 10, marginBottom: 12, alignItems: "center" }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: c.success }}>Report submitted successfully.</Text>
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setOpen(false)}
                  style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.muted, justifyContent: "center", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: c["muted-foreground"] }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={submitting || submitted || !subject || !description}
                  style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.destructive, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 6, opacity: (submitting || submitted || !subject || !description) ? 0.6 : 1 }}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={14} color="#fff" />
                  )}
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>
                    {submitting ? "Submitting..." : submitted ? "Submitted!" : "Submit Report"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useUser } from "../../auth/context/user.context";
import {
  submitAppeal,
  getAppealMessages,
  sendAppealMessage,
  removeCompanyMember,
} from "../../admin/services/admin.service";
import { supabase } from "../../../shared/services/supabase";

export default function CompanySuspendedPage({ company, membershipPermission, onLeave }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const { profile } = useUser();
  const insets = useSafeAreaInsets();

  const isHrManager = membershipPermission === "hr_manager";

  const [appealStatus, setAppealStatus] = useState(company?.appeal_status || "none");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [appealMessages, setAppealMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (appealStatus === "pending_review") {
      loadMessages();
    }
  }, [appealStatus]);

  useEffect(() => {
    if (appealStatus !== "pending_review" || !company?.id) return;
    const channel = supabase
      .channel(`company-suspended-${company.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "appeal_messages", filter: `entity_id=eq.${company.id}` }, (payload) => {
        setAppealMessages((prev) => [...prev, payload.new]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "companies", filter: `id=eq.${company.id}` }, (payload) => {
        if (payload.new?.appeal_status) setAppealStatus(payload.new.appeal_status);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [appealStatus, company?.id]);

  async function loadMessages() {
    try {
      const msgs = await getAppealMessages({ entityType: "company", entityId: company.id });
      setAppealMessages(msgs || []);
    } catch (err) {
      console.warn("Failed to load appeal messages:", err);
    }
  }

  async function handleSubmitAppeal() {
    if (!message.trim() || !profile?.id) return;
    setSubmitting(true);
    try {
      await submitAppeal({ entityType: "company", entityId: company.id, senderId: profile.id, message: message.trim() });
      setAppealStatus("pending_review");
      setShowForm(false);
      setMessage("");
    } catch (err) {
      Alert.alert("Error", "Failed to submit appeal.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendChat() {
    if (!chatInput.trim() || !profile?.id) return;
    setSending(true);
    try {
      await sendAppealMessage({ entityType: "company", entityId: company.id, senderId: profile.id, message: chatInput.trim() });
      setChatInput("");
    } catch (err) {
      Alert.alert("Error", "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      await removeCompanyMember(profile?.id, company.id);
      onLeave && onLeave();
    } catch (err) {
      console.warn("Failed to leave company:", err);
    } finally {
      setLeaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: `${c.destructive}20`, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Ionicons name="shield-checkmark" size={28} color={c.destructive} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: "800", color: c.foreground, marginBottom: 4 }}>
          Company Suspended
        </Text>
        <Text style={{ fontSize: 13, color: c["muted-foreground"], marginBottom: 8 }}>
          This company has been banned due to a violation of our terms.
        </Text>

        {company?.suspension_reason && (
          <View style={{ backgroundColor: c.muted, borderRadius: 10, padding: 14, marginBottom: 24 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: c.foreground, marginBottom: 4 }}>Reason:</Text>
            <Text style={{ fontSize: 11, color: c["muted-foreground"] }}>{company.suspension_reason}</Text>
          </View>
        )}

        {/* HR Manager: appeal flow */}
        {isHrManager && appealStatus === "none" && !showForm && (
          <View style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              style={{ width: "100%", paddingVertical: 14, borderRadius: 12, backgroundColor: c.primary, alignItems: "center" }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>Submit Appeal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLeave}
              disabled={leaving}
              style={{ width: "100%", paddingVertical: 14, borderRadius: 12, backgroundColor: c.muted, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
              activeOpacity={0.8}
            >
              {leaving ? (
                <ActivityIndicator size="small" color={c["muted-foreground"]} />
              ) : (
                <Ionicons name="exit-outline" size={16} color={c["muted-foreground"]} />
              )}
              <Text style={{ fontSize: 13, fontWeight: "600", color: c["muted-foreground"] }}>Leave Company</Text>
            </TouchableOpacity>
          </View>
        )}

        {isHrManager && appealStatus === "none" && showForm && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: c.foreground, marginBottom: 8 }}>
              Explain your situation to the admin team.
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Explain why your company should be reinstated..."
              multiline
              numberOfLines={5}
              style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 14, fontSize: 13, color: c.foreground, backgroundColor: c.background, textAlignVertical: "top", minHeight: 120 }}
              placeholderTextColor={c["muted-foreground"]}
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: c.muted, alignItems: "center" }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: c["muted-foreground"] }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitAppeal}
                disabled={submitting || !message.trim()}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: c.primary, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6, opacity: submitting || !message.trim() ? 0.6 : 1 }}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={14} color="#fff" />
                )}
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>
                  {submitting ? "Submitting..." : "Submit Appeal"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isHrManager && appealStatus === "pending_review" && (
          <View style={{ gap: 12 }}>
            <View style={{ backgroundColor: `${c.warning}18`, borderWidth: 1, borderColor: `${c.warning}30`, borderRadius: 12, padding: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: c.warning }}>Appeal Pending Review</Text>
              <Text style={{ fontSize: 11, color: c["muted-foreground"], marginTop: 4 }}>
                Your appeal has been submitted and is awaiting admin review. You'll be notified when a decision is made.
              </Text>
            </View>

            {appealMessages.length > 0 && (
              <View style={{ backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border, padding: 12, maxHeight: 200 }}>
                <ScrollView>
                  {appealMessages.map((msg) => {
                    const isMe = msg.sender_id === profile?.id;
                    return (
                      <View key={msg.id} style={{ flexDirection: "row", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 8 }}>
                        <View style={{ maxWidth: "80%", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: isMe ? c.primary : c.muted }}>
                          <Text style={{ fontSize: 10, fontWeight: "700", opacity: 0.7, color: isMe ? "#fff" : c.foreground, marginBottom: 2 }}>
                            {isMe ? "You" : "Admin"}
                          </Text>
                          <Text style={{ fontSize: 12, color: isMe ? "#fff" : c.foreground }}>{msg.message}</Text>
                          <Text style={{ fontSize: 9, opacity: 0.5, color: isMe ? "#fff" : c["muted-foreground"], marginTop: 2 }}>
                            {new Date(msg.created_at).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  <View ref={bottomRef} />
                </ScrollView>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Reply to admin..."
                style={{ flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: c.foreground, backgroundColor: c.background }}
                placeholderTextColor={c["muted-foreground"]}
              />
              <TouchableOpacity
                onPress={handleSendChat}
                disabled={sending || !chatInput.trim()}
                style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", opacity: sending || !chatInput.trim() ? 0.6 : 1 }}
                activeOpacity={0.8}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLeave}
              disabled={leaving}
              style={{ width: "100%", paddingVertical: 14, borderRadius: 12, backgroundColor: c.muted, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
              activeOpacity={0.8}
            >
              {leaving ? (
                <ActivityIndicator size="small" color={c["muted-foreground"]} />
              ) : (
                <Ionicons name="exit-outline" size={16} color={c["muted-foreground"]} />
              )}
              <Text style={{ fontSize: 13, fontWeight: "600", color: c["muted-foreground"] }}>Leave Company</Text>
            </TouchableOpacity>
          </View>
        )}

        {isHrManager && appealStatus === "rejected" && (
          <View style={{ gap: 12 }}>
            <View style={{ backgroundColor: `${c.destructive}18`, borderWidth: 1, borderColor: `${c.destructive}30`, borderRadius: 12, padding: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: c.destructive }}>Appeal Rejected</Text>
              <Text style={{ fontSize: 11, color: c["muted-foreground"], marginTop: 4 }}>
                Your appeal has been reviewed and rejected. This decision is final.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLeave}
              disabled={leaving}
              style={{ width: "100%", paddingVertical: 14, borderRadius: 12, backgroundColor: c.muted, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
              activeOpacity={0.8}
            >
              {leaving ? (
                <ActivityIndicator size="small" color={c["muted-foreground"]} />
              ) : (
                <Ionicons name="exit-outline" size={16} color={c["muted-foreground"]} />
              )}
              <Text style={{ fontSize: 13, fontWeight: "600", color: c["muted-foreground"] }}>Leave Company</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Not HR manager: read-only */}
        {!isHrManager && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 12, color: c["muted-foreground"], marginBottom: 8 }}>
              Only HR managers can submit an appeal. Contact your HR team for more information.
            </Text>
            <TouchableOpacity
              onPress={handleLeave}
              disabled={leaving}
              style={{ width: "100%", paddingVertical: 14, borderRadius: 12, backgroundColor: c.muted, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
              activeOpacity={0.8}
            >
              {leaving ? (
                <ActivityIndicator size="small" color={c["muted-foreground"]} />
              ) : (
                <Ionicons name="exit-outline" size={16} color={c["muted-foreground"]} />
              )}
              <Text style={{ fontSize: 13, fontWeight: "600", color: c["muted-foreground"] }}>Leave Company</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

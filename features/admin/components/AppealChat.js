import { useState, useEffect, useRef } from "react";
import {
  View, Text, Modal, TouchableOpacity, TextInput, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { supabase } from "../../../shared/services/supabase";
import { getAppealMessages, sendAppealMessage, resolveAppeal } from "../services/admin.service";

export default function AppealChat({ visible, onClose, entityType, entityId, entityName, currentUserId }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!visible || !entityId) return;
    loadMessages();

    const channel = supabase
      .channel(`appeal-chat-${entityId}-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "appeal_messages", filter: `entity_type=eq.${entityType}` },
        (payload) => {
          if (payload.new.entity_id === entityId) {
            setMessages((prev) => [...prev, { ...payload.new, sender: payload.new.sender || null }]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [visible, entityId, entityType]);

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await getAppealMessages({ entityType, entityId });
      setMessages(data);
    } catch (err) {
      console.warn("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendAppealMessage({ entityType, entityId, senderId: currentUserId, message: input.trim() });
      setInput("");
    } catch (err) {
      console.warn("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleResolve(approved) {
    setResolving(true);
    try {
      await resolveAppeal({ entityType, entityId, adminId: currentUserId, approved, adminNote: approved ? "Appeal approved by admin." : "Appeal rejected by admin." });
      onClose();
    } catch (err) {
      console.warn("Failed to resolve appeal:", err);
    } finally {
      setResolving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%", minHeight: "50%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: "700", color: c.foreground }}>{entityName || "Appeal Chat"}</Text>
                <Text style={{ fontSize: 11, color: c["muted-foreground"] }}>{entityType === "profile" ? "User Appeal" : "Company Appeal"}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Text style={{ fontSize: 18, color: c["muted-foreground"] }}>✕</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                <ActivityIndicator size="small" color={c.primary} />
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id?.toString()}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                style={{ flex: 1, paddingHorizontal: 12 }}
                contentContainerStyle={{ paddingVertical: 12, gap: 8 }}
                ListEmptyComponent={
                  <Text style={{ textAlign: "center", fontSize: 12, color: c["muted-foreground"], padding: 20 }}>
                    No messages yet.
                  </Text>
                }
                renderItem={({ item }) => {
                  const isMe = item.sender_id === currentUserId;
                  return (
                    <View style={{ alignItems: isMe ? "flex-end" : "flex-start" }}>
                      <View style={{
                        maxWidth: "80%", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
                        backgroundColor: isMe ? c.primary : c.muted,
                        borderBottomRightRadius: isMe ? 4 : 12,
                        borderBottomLeftRadius: isMe ? 12 : 4,
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: isMe ? "rgba(255,255,255,0.7)" : c["muted-foreground"], marginBottom: 2 }}>
                          {item.sender_id === currentUserId ? "You" : item.sender?.full_name || "Admin"}
                        </Text>
                        <Text style={{ fontSize: 13, color: isMe ? "#fff" : c.foreground }}>{item.message}</Text>
                        <Text style={{ fontSize: 9, color: isMe ? "rgba(255,255,255,0.5)" : c["muted-foreground"], marginTop: 4 }}>
                          {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />
            )}

            <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: c.border, gap: 8 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Reply..."
                  placeholderTextColor={c["muted-foreground"]}
                  style={{
                    flex: 1, backgroundColor: c.background, borderWidth: 1, borderColor: c.border,
                    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: c.foreground,
                  }}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={sending || !input.trim()}
                  style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primary, justifyContent: "center", alignItems: "center", opacity: (sending || !input.trim()) ? 0.5 : 1 }}
                >
                  {sending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16 }}>↑</Text>}
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => handleResolve(true)}
                  disabled={resolving}
                  style={{ flex: 1, height: 40, borderRadius: 12, backgroundColor: c.success, justifyContent: "center", alignItems: "center" }}
                >
                  {resolving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>Approve</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleResolve(false)}
                  disabled={resolving}
                  style={{ flex: 1, height: 40, borderRadius: 12, backgroundColor: c.destructive, justifyContent: "center", alignItems: "center" }}
                >
                  {resolving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>Reject</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

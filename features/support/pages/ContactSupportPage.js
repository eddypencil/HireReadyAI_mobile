import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useUser } from "../../auth/context/user.context";
import { supabase } from "../../../shared/services/supabase";
import { sendAppealMessage } from "../../admin/services/admin.service";

export default function ContactSupportPage({ route, navigation }) {
  const { companyId, companyName, suspensionReason, closingDeadline } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { profile } = useUser();
  const c = theme.colors;
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("appeal_messages")
      .select("*, sender:profiles!sender_id(id, full_name, role)")
      .eq("entity_type", "company")
      .eq("entity_id", companyId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    const channel = supabase
      .channel(`contact-support-${companyId}-${Date.now()}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "appeal_messages",
        filter: `entity_type=eq.company`,
      }, (payload) => {
        if (payload.new.entity_id === companyId) {
          setMessages((prev) => [...prev, payload.new]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyId]);

  useEffect(() => {
    if (!loading && scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || !profile?.id || sending) return;
    setSending(true);
    try {
      await sendAppealMessage({ entityType: "company", entityId: companyId, senderId: profile.id, message: input.trim() });
      setInput("");
    } catch (err) {
      console.warn("Failed to send:", err);
    } finally {
      setSending(false);
    }
  };

  return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: c.background }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "android" ? insets.top + 50 : 0}
      >
        <View style={{ paddingTop: insets.top, backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
              <Text style={{ fontSize: 22, color: c.foreground }}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: c.foreground }}>Contact Support</Text>
              <Text style={{ fontSize: 11, color: c["muted-foreground"], marginTop: 1 }}>{companyName}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, padding: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {suspensionReason && (
            <View style={{ marginBottom: 12, padding: 10, borderRadius: 8, backgroundColor: `${c.warning}18`, borderWidth: 1, borderColor: `${c.warning}30` }}>
              <Text style={{ fontSize: 10, fontWeight: "600", color: c.warning }}>CLOSURE REASON</Text>
              <Text style={{ fontSize: 12, color: c["muted-foreground"], marginTop: 2 }}>{suspensionReason}</Text>
              {closingDeadline && (
                <Text style={{ fontSize: 11, color: c["muted-foreground"], marginTop: 4 }}>
                  Deadline: {new Date(closingDeadline).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}
          {loading ? (
            <ActivityIndicator size="small" color={c.primary} style={{ padding: 20 }} />
          ) : messages.length === 0 ? (
            <Text style={{ textAlign: "center", fontSize: 12, color: c["muted-foreground"], padding: 20, marginTop: suspensionReason ? 0 : 20 }}>No messages yet.</Text>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === profile?.id;
              return (
                <View key={msg.id} style={{ alignItems: isMe ? "flex-end" : "flex-start", marginBottom: 6 }}>
                  <View style={{ maxWidth: "80%", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: isMe ? c.primary : c.muted, borderBottomRightRadius: isMe ? 4 : 12, borderBottomLeftRadius: isMe ? 12 : 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: isMe ? "rgba(255,255,255,0.7)" : c["muted-foreground"] }}>
                      {isMe ? "You" : "Admin"}
                    </Text>
                    <Text style={{ fontSize: 13, color: isMe ? "#fff" : c.foreground }}>{msg.message}</Text>
                    <Text style={{ fontSize: 9, color: isMe ? "rgba(255,255,255,0.5)" : c["muted-foreground"], marginTop: 4 }}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

      <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, 12) }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={c["muted-foreground"]}
            style={{ flex: 1, backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: c.foreground }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={sending || !input.trim()}
            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primary, justifyContent: "center", alignItems: "center", opacity: (sending || !input.trim()) ? 0.5 : 1 }}
          >
            {sending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16 }}>↑</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

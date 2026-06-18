import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  submitAppeal,
  getAppealMessages,
  sendAppealMessage,
} from "../../admin/services/admin.service";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useUser } from "../context/user.context";
import { supabase } from "../../../shared/services/supabase";

export default function AccountSuspendedPage({ navigation }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { profile, user, signOutUser, session } = useUser();
  const flatListRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [frozenTimeLeft, setFrozenTimeLeft] = useState("");
  const [appealMessages, setAppealMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [deadlineLeft, setDeadlineLeft] = useState("");
  const [localAppealStatus, setLocalAppealStatus] = useState(null);

  useEffect(() => {
    if (!session || !user) {
      navigation?.replace("Login");
    }
  }, [session, user]);

  useEffect(() => {
    if (profile?.account_status === "frozen" && profile?.frozen_until) {
      const until = new Date(profile.frozen_until);
      const diff = until.getTime() - Date.now();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setFrozenTimeLeft(`${hours}h ${minutes}m remaining`);
      } else {
        setFrozenTimeLeft("Expiring soon");
      }
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.appeal_deadline && profile?.appeal_status === "none") {
      const deadline = new Date(profile.appeal_deadline);
      const diff = deadline.getTime() - Date.now();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        setDeadlineLeft(`${days}d ${hours}h remaining to appeal`);
      } else {
        setDeadlineLeft("Appeal deadline passed");
      }
    }
  }, [profile]);

  useEffect(() => {
    const status = localAppealStatus || profile?.appeal_status;
    if (profile?.id && (status === "pending_review" || status === "rejected")) {
      loadMessages();
    }
  }, [profile?.id, profile?.appeal_status, localAppealStatus]);

  useEffect(() => {
    if (profile?.account_status !== "banned") return;
    const channel = supabase
      .channel(`suspended-${profile.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          if (payload.new.account_status === "active") {
            navigation?.replace("Main");
          }
          if (
            payload.new.appeal_status &&
            payload.new.appeal_status !== localAppealStatus
          ) {
            setLocalAppealStatus(payload.new.appeal_status);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appeal_messages",
          filter: `entity_type=eq.profile`,
        },
        (payload) => {
          if (payload.new.entity_id === profile.id) {
            setAppealMessages((prev) => [...prev, payload.new]);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, profile?.account_status]);

  async function loadMessages() {
    if (!user?.id) return;
    try {
      const data = await getAppealMessages({
        entityType: "profile",
        entityId: user.id,
      });
      setAppealMessages(data);
    } catch (err) {
      console.warn("Failed to load messages:", err);
    }
  }

  async function handleSubmitAppeal() {
    if (!message.trim() || !user?.id) return;
    setSubmitting(true);
    try {
      await submitAppeal({
        entityType: "profile",
        entityId: user.id,
        senderId: user.id,
        message: message.trim(),
      });
      setLocalAppealStatus("pending_review");
      setMessage("");
      loadMessages();
    } catch (err) {
      console.warn("Failed to submit appeal:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendChat() {
    if (!chatInput.trim() || sending || !user?.id) return;
    setSending(true);
    try {
      await sendAppealMessage({
        entityType: "profile",
        entityId: user.id,
        senderId: user.id,
        message: chatInput.trim(),
      });
      setChatInput("");
    } catch (err) {
      console.warn("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleLogout() {
    await signOutUser();
    navigation?.replace("Login");
  }

  if (!profile) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const isBanned = profile.account_status === "banned";
  const isFrozen = profile.account_status === "frozen";
  const appealStatus = localAppealStatus || profile.appeal_status || "none";

  if (!isBanned && !isFrozen) {
    navigation?.replace("Main");
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: c.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: `${isBanned ? c.destructive : c.warning}20`,
              borderWidth: 1,
              borderColor: `${isBanned ? c.destructive : c.warning}30`,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                color: isBanned ? c.destructive : c.warning,
              }}
            >
              {isBanned ? "⚠" : "⏰"}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: c.foreground,
              textAlign: "center",
            }}
          >
            {isBanned ? "Account Suspended" : "Account Frozen"}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: c["muted-foreground"],
              textAlign: "center",
              marginTop: 4,
              marginBottom: 4,
            }}
          >
            {isBanned
              ? "Your account has been suspended due to a violation of our terms."
              : "Your account has been temporarily frozen."}
          </Text>

          {isFrozen && frozenTimeLeft ? (
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: c.warning,
                marginBottom: 12,
              }}
            >
              {frozenTimeLeft}
            </Text>
          ) : null}

          {isBanned && deadlineLeft && appealStatus === "none" ? (
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: c.warning,
                marginBottom: 12,
              }}
            >
              {deadlineLeft}
            </Text>
          ) : null}

          {profile.suspension_reason ? (
            <View
              style={{
                backgroundColor: c.muted,
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
                width: "100%",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: c.foreground,
                  marginBottom: 2,
                }}
              >
                Reason:
              </Text>
              <Text style={{ fontSize: 12, color: c["muted-foreground"] }}>
                {profile.suspension_reason}
              </Text>
            </View>
          ) : null}

          {/* Appeal states */}
          {isBanned && appealStatus === "none" && !showForm && (
            <View style={{ width: "100%", gap: 8 }}>
              <TouchableOpacity
                onPress={() => setShowForm(true)}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: c.primary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}
                >
                  Submit Appeal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${c.destructive}15`,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: c.destructive,
                  }}
                >
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isBanned && appealStatus === "none" && showForm && (
            <View style={{ width: "100%", gap: 10 }}>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: c.foreground }}
              >
                Explain your situation to the admin team. You have until{" "}
                {profile?.appeal_deadline
                  ? new Date(profile.appeal_deadline).toLocaleDateString()
                  : "soon"}
                .
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Explain why your account should be reinstated..."
                placeholderTextColor={c["muted-foreground"]}
                multiline
                numberOfLines={5}
                style={{
                  backgroundColor: c.background,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 13,
                  color: c.foreground,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
              />
              <TouchableOpacity
                onPress={handleSubmitAppeal}
                disabled={submitting || !message.trim()}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: c.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: submitting || !message.trim() ? 0.6 : 1,
                }}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}
                  >
                    Submit Appeal
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: c.muted,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: c["muted-foreground"],
                  }}
                >
                  Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${c.destructive}15`,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: c.destructive,
                  }}
                >
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isBanned && appealStatus === "pending_review" && (
            <View style={{ width: "100%", gap: 10 }}>
              <View
                style={{
                  backgroundColor: `${c.warning}15`,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${c.warning}30`,
                  padding: 12,
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: c.warning }}
                >
                  Appeal Pending Review
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: c["muted-foreground"],
                    marginTop: 2,
                  }}
                >
                  Your appeal has been submitted and is awaiting admin review.
                </Text>
              </View>

              {appealMessages.length > 0 && (
                <View
                  style={{
                    backgroundColor: c.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: c.border,
                    padding: 10,
                    maxHeight: 180,
                  }}
                >
                  <ScrollView>
                    {appealMessages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <View
                          key={msg.id}
                          style={{
                            alignItems: isMe ? "flex-end" : "flex-start",
                            marginBottom: 6,
                          }}
                        >
                          <View
                            style={{
                              maxWidth: "85%",
                              borderRadius: 10,
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              backgroundColor: isMe ? c.primary : c.muted,
                              borderBottomRightRadius: isMe ? 4 : 10,
                              borderBottomLeftRadius: isMe ? 10 : 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 9,
                                fontWeight: "700",
                                color: isMe
                                  ? "rgba(255,255,255,0.7)"
                                  : c["muted-foreground"],
                              }}
                            >
                              {isMe ? "You" : "Admin"}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: isMe ? "#fff" : c.foreground,
                              }}
                            >
                              {msg.message}
                            </Text>
                            <Text
                              style={{
                                fontSize: 8,
                                color: isMe
                                  ? "rgba(255,255,255,0.5)"
                                  : c["muted-foreground"],
                                marginTop: 2,
                              }}
                            >
                              {msg.created_at
                                ? new Date(msg.created_at).toLocaleString()
                                : ""}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 6 }}>
                <TextInput
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Reply to admin..."
                  placeholderTextColor={c["muted-foreground"]}
                  style={{
                    flex: 1,
                    backgroundColor: c.background,
                    borderWidth: 1,
                    borderColor: c.border,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    fontSize: 13,
                    color: c.foreground,
                  }}
                />
                <TouchableOpacity
                  onPress={handleSendChat}
                  disabled={sending || !chatInput.trim()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: c.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: sending || !chatInput.trim() ? 0.5 : 1,
                  }}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ fontSize: 16, color: "#fff" }}>↑</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${c.destructive}15`,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: c.destructive,
                  }}
                >
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isBanned && appealStatus === "rejected" && (
            <View style={{ width: "100%", gap: 10 }}>
              <View
                style={{
                  backgroundColor: `${c.destructive}15`,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${c.destructive}30`,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: c.destructive,
                  }}
                >
                  Appeal Rejected
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: c["muted-foreground"],
                    marginTop: 2,
                  }}
                >
                  Your appeal has been reviewed and rejected. This decision is
                  final.
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${c.destructive}15`,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: c.destructive,
                  }}
                >
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isFrozen && (
            <View style={{ width: "100%" }}>
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${c.destructive}15`,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: c.destructive,
                  }}
                >
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

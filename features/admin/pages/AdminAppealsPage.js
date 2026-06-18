import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useUser } from "../../auth/context/user.context";
import { getPendingAppeals } from "../services/admin.service";
import AppealChat from "../components/AppealChat";

export default function AdminAppealsPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const { user } = useUser();

  const [tab, setTab] = useState("users");
  const [userAppeals, setUserAppeals] = useState([]);
  const [companyAppeals, setCompanyAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatEntity, setChatEntity] = useState(null);

  useEffect(() => { loadAppeals(); }, []);

  async function loadAppeals() {
    try {
      const data = await getPendingAppeals();
      setUserAppeals(data.users);
      setCompanyAppeals(data.companies);
    } catch (err) {
      console.warn("Load appeals error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadAppeals();
    setRefreshing(false);
  }

  function openChat(item, type) {
    setChatEntity({
      entityType: type,
      entityId: item.id,
      entityName: item.full_name || item.name || "Unknown",
      currentUserId: user?.id,
    });
    setChatVisible(true);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const appeals = tab === "users" ? userAppeals : companyAppeals;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.foreground }}>Appeals</Text>
        <Text style={{ fontSize: 13, color: c["muted-foreground"], marginTop: 2 }}>Review pending appeals</Text>
      </View>

      <View style={{ flexDirection: "row", marginHorizontal: 16, marginBottom: 12, backgroundColor: c.muted, borderRadius: 12, padding: 3 }}>
        {["users", "companies"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: tab === t ? c.card : "transparent", alignItems: "center" }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: tab === t ? c.foreground : c["muted-foreground"] }}>
              {t === "users" ? "Users" : "Companies"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {appeals.length === 0 ? (
          <Text style={{ fontSize: 12, color: c["muted-foreground"], textAlign: "center", padding: 32 }}>
            No pending {tab} appeals.
          </Text>
        ) : (
          appeals.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => openChat(item, tab === "users" ? "profile" : "company")}
              style={{ backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 8 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: c.foreground }}>
                    {item.full_name || item.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: c["muted-foreground"], marginTop: 2 }}>
                    {item.role ? `${item.role} • ` : ""}
                    {item.email || ""}
                  </Text>
                </View>
                {item.appeal_deadline && (
                  <Text style={{ fontSize: 10, color: c.warning }}>
                    {new Date(item.appeal_deadline).toLocaleDateString()}
                  </Text>
                )}
              </View>
              {item.appeal_message && (
                <Text style={{ fontSize: 12, color: c["muted-foreground"], marginTop: 6 }} numberOfLines={2}>
                  {item.appeal_message}
                </Text>
              )}
              {item.suspension_reason && (
                <View style={{ backgroundColor: `${c.destructive}15`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: "flex-start" }}>
                  <Text style={{ fontSize: 10, color: c.destructive }}>{item.suspension_reason}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {chatEntity && (
        <AppealChat
          visible={chatVisible}
          onClose={() => { setChatVisible(false); setChatEntity(null); }}
          entityType={chatEntity.entityType}
          entityId={chatEntity.entityId}
          entityName={chatEntity.entityName}
          currentUserId={chatEntity.currentUserId}
        />
      )}
    </View>
  );
}

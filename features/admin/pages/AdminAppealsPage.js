import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useUser } from "../../auth/context/user.context";
import { getPendingAppeals, getResolvedAppeals } from "../services/admin.service";
import AppealChat from "../components/AppealChat";

export default function AdminAppealsPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const { user } = useUser();

  const [mainTab, setMainTab] = useState("pending");
  const [subTab, setSubTab] = useState("users");
  const [userAppeals, setUserAppeals] = useState([]);
  const [companyAppeals, setCompanyAppeals] = useState([]);
  const [resolvedData, setResolvedData] = useState({ users: [], companies: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatEntity, setChatEntity] = useState(null);

  useEffect(() => { loadAppeals(); }, []);

  async function loadAppeals() {
    try {
      const [pending, resolved] = await Promise.all([
        getPendingAppeals(),
        getResolvedAppeals(),
      ]);
      setUserAppeals(pending.users);
      setCompanyAppeals(pending.companies);
      setResolvedData(resolved);
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

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.foreground }}>Appeals</Text>
        <Text style={{ fontSize: 13, color: c["muted-foreground"], marginTop: 2 }}>Review appeals</Text>
      </View>

      {/* Pending / History tabs */}
      <View style={{ flexDirection: "row", marginHorizontal: 16, marginBottom: 8, backgroundColor: c.muted, borderRadius: 10, padding: 2 }}>
        {["pending", "history"].map((mt) => (
          <TouchableOpacity
            key={mt}
            onPress={() => setMainTab(mt)}
            style={{ flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: mainTab === mt ? c.card : "transparent", alignItems: "center" }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: mainTab === mt ? c.foreground : c["muted-foreground"], textTransform: "capitalize" }}>
              {mt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sub-tab (Users / Companies) */}
      {(() => {
        const rows = mainTab === "pending"
          ? (subTab === "users" ? userAppeals : companyAppeals)
          : (subTab === "users" ? resolvedData.users : resolvedData.companies);

        return (
          <>
            <View style={{ flexDirection: "row", marginHorizontal: 16, marginBottom: 12, backgroundColor: c.muted, borderRadius: 12, padding: 3 }}>
              {["users", "companies"].map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => setSubTab(st)}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: subTab === st ? c.card : "transparent", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: subTab === st ? c.foreground : c["muted-foreground"] }}>
                    {st === "users" ? "Users" : "Companies"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView
              style={{ flex: 1, paddingHorizontal: 16 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              {rows.length === 0 ? (
                <Text style={{ fontSize: 12, color: c["muted-foreground"], textAlign: "center", padding: 32 }}>
                  No {mainTab} {subTab} appeals.
                </Text>
              ) : (
                rows.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => mainTab === "pending" ? openChat(item, subTab === "users" ? "profile" : "company") : null}
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
                      {mainTab === "pending" && item.appeal_deadline && (
                        <Text style={{ fontSize: 10, color: c.warning }}>
                          {new Date(item.appeal_deadline).toLocaleDateString()}
                        </Text>
                      )}
                      {mainTab === "history" && item.appeal_status && (
                        <View style={{ backgroundColor: item.appeal_status === "approved" ? `${c.success}22` : `${c.destructive}22`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ fontSize: 10, fontWeight: "600", color: item.appeal_status === "approved" ? c.success : c.destructive, textTransform: "capitalize" }}>
                            {item.appeal_status}
                          </Text>
                        </View>
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
          </>
        );
      })()}

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

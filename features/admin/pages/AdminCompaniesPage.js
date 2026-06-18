import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { getAllCompaniesWithStats, applyCompanyAction } from "../services/admin.service";
import CompanyActionDialog from "../components/CompanyActionDialog";

const statusLabel = (s) => {
  if (s === "closing_warning") return "Closing";
  if (s === "banned") return "Banned";
  return "Active";
};
const statusDot = (s, c) => {
  if (s === "closing_warning") return c.warning;
  if (s === "banned") return c.destructive;
  return c.success;
};

export default function AdminCompaniesPage() {
  const { theme } = useTheme();
  const c = theme.colors;

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionCompany, setActionCompany] = useState(null);
  const [actionType, setActionType] = useState("");

  useEffect(() => { loadCompanies(); }, []);

  async function loadCompanies() {
    try {
      const data = await getAllCompaniesWithStats();
      setCompanies(data);
    } catch (err) {
      console.warn("Load companies error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadCompanies();
    setRefreshing(false);
  }

  async function handleAction({ actionType: at, reason }) {
    if (!actionCompany) return;
    await applyCompanyAction({ companyId: actionCompany.id, actionType: at, reason });
    setActionCompany(null);
    setActionType("");
    setSelected(null);
    setShowDetail(false);
    await loadCompanies();
  }

  function openAction(type) {
    setActionCompany(selected);
    setActionType(type);
    setShowDetail(false);
  }

  const filtered = companies.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()));

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
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.foreground }}>Companies</Text>
        <Text style={{ fontSize: 13, color: c["muted-foreground"], marginTop: 2 }}>Manage companies and apply actions</Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search companies..."
          placeholderTextColor={c["muted-foreground"]}
          style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: c.foreground }}
        />
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {filtered.map((comp) => (
            <TouchableOpacity
              key={comp.id}
              onPress={() => { setSelected(comp); setShowDetail(true); }}
              style={{ width: "48%", backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 12 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${c.primary}15`, justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: c.primary }}>{comp.name?.charAt(0)?.toUpperCase() || "?"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: c.foreground }} numberOfLines={1}>{comp.name}</Text>
                  <Text style={{ fontSize: 10, color: c["muted-foreground"], marginTop: 1 }} numberOfLines={1}>{comp.industry || "—"}</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: `${statusDot(comp.account_status, c)}18`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: statusDot(comp.account_status, c) }} />
                  <Text style={{ fontSize: 9, fontWeight: "600", color: statusDot(comp.account_status, c) }}>
                    {statusLabel(comp.account_status)}
                    {comp.closing_deadline ? ` (${new Date(comp.closing_deadline).toLocaleDateString()})` : ""}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
                <Text style={{ fontSize: 10, color: c["muted-foreground"] }}>{comp.activeJobs}/{comp.totalJobs} jobs</Text>
                <Text style={{ fontSize: 10, color: c["muted-foreground"] }}>{comp.memberCount} members</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {filtered.length === 0 && !loading && (
          <Text style={{ fontSize: 12, color: c["muted-foreground"], textAlign: "center", padding: 20 }}>No companies found.</Text>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={showDetail} transparent animationType="fade" onRequestClose={() => setShowDetail(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: c.card, borderRadius: 20, overflow: "hidden" }}>
            <View style={{ padding: 20, alignItems: "center" }}>
              <TouchableOpacity onPress={() => setShowDetail(false)} style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: c.muted, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: c["muted-foreground"], lineHeight: 16 }}>X</Text>
              </TouchableOpacity>

              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: `${c.primary}15`, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: c.primary }}>{selected?.name?.charAt(0)?.toUpperCase() || "?"}</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: c.foreground }}>{selected?.name}</Text>
              <Text style={{ fontSize: 11, color: c["muted-foreground"], marginTop: 1 }}>{selected?.industry || "—"}</Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, backgroundColor: `${statusDot(selected?.account_status, c)}18`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}>
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: statusDot(selected?.account_status, c) }} />
                <Text style={{ fontSize: 10, fontWeight: "600", color: statusDot(selected?.account_status, c) }}>
                  {statusLabel(selected?.account_status)}
                  {selected?.closing_deadline ? ` (by ${new Date(selected.closing_deadline).toLocaleDateString()})` : ""}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 8, paddingBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: c.background, borderRadius: 12, padding: 10, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: c.foreground }}>{selected?.activeJobs}</Text>
                <Text style={{ fontSize: 9, color: c["muted-foreground"], marginTop: 1 }}>Active Jobs</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: c.background, borderRadius: 12, padding: 10, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: c.foreground }}>{selected?.memberCount}</Text>
                <Text style={{ fontSize: 9, color: c["muted-foreground"], marginTop: 1 }}>Members</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: c.background, borderRadius: 12, padding: 10, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: (selected?.severity_score ?? 0) >= 20 ? c.destructive : c.foreground }}>{selected?.severity_score ?? 0}</Text>
                <Text style={{ fontSize: 9, color: c["muted-foreground"], marginTop: 1 }}>Score</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: c.background, borderRadius: 12, padding: 10, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: c.foreground }}>{selected?.totalJobs}</Text>
                <Text style={{ fontSize: 9, color: c["muted-foreground"], marginTop: 1 }}>Total Jobs</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 20 }}>
              <TouchableOpacity onPress={() => openAction("warn")} style={{ width: "47%", height: 38, borderRadius: 12, backgroundColor: `${c.warning}18`, borderWidth: 1, borderColor: `${c.warning}30`, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: c.warning }}>Warn</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openAction("closing_warning")} style={{ width: "47%", height: 38, borderRadius: 12, backgroundColor: "#ff8c0018", borderWidth: 1, borderColor: "#ff8c0030", justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#ff8c00" }}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openAction("ban")} style={{ width: "47%", height: 38, borderRadius: 12, backgroundColor: `${c.destructive}18`, borderWidth: 1, borderColor: `${c.destructive}30`, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: c.destructive }}>Ban</Text>
              </TouchableOpacity>
              {selected?.account_status !== "active" && (
                <TouchableOpacity onPress={() => openAction("active")} style={{ width: "47%", height: 38, borderRadius: 12, backgroundColor: `${c.success}18`, borderWidth: 1, borderColor: `${c.success}30`, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: c.success }}>Reinstate</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <CompanyActionDialog
        visible={!!actionCompany}
        onClose={() => { setActionCompany(null); setActionType(""); }}
        onSubmit={handleAction}
        company={actionCompany}
        initialActionType={actionType}
      />
    </View>
  );
}

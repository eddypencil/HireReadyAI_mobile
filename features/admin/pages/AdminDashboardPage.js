import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useUser } from "../../auth/context/user.context";
import {
  getUserCountsByRole, getFlaggedEntities, getAllCompaniesWithStats,
  getPendingAppeals, getAllUsers, applyUserAction,
} from "../services/admin.service";
import UserActionDialog from "../components/UserActionDialog";
import CreateAdminDialog from "../components/CreateAdminDialog";

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const { profile } = useUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, recruiters: 0, applicants: 0, flagged: 0, companies: 0, pendingAppeals: 0 });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [filterRole, setFilterRole] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [counts, flagged, companies, appeals] = await Promise.all([
        getUserCountsByRole(), getFlaggedEntities(), getAllCompaniesWithStats(), getPendingAppeals(),
      ]);
      setStats({
        totalUsers: (counts.applicant || 0) + (counts.recruiter || 0),
        recruiters: counts.recruiter || 0,
        applicants: counts.applicant || 0,
        flagged: (flagged.users?.length || 0) + (flagged.companies?.length || 0),
        companies: companies.length,
        pendingAppeals: (appeals.users?.length || 0) + (appeals.companies?.length || 0),
      });
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.warn("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleUserAction(params) {
    await applyUserAction({ ...params, adminId: profile?.id });
    await loadData();
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, color: c.primary },
    { label: "Recruiters", value: stats.recruiters, color: c.info },
    { label: "Applicants", value: stats.applicants, color: c.success },
    { label: "Flagged", value: stats.flagged, color: c.destructive },
    { label: "Companies", value: stats.companies, color: c.warning },
    { label: "Pending Appeals", value: stats.pendingAppeals, color: c.primary },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.foreground }}>Admin Dashboard</Text>
        <Text style={{ fontSize: 13, color: c["muted-foreground"], marginTop: 2 }}>Overview and user management</Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {[0, 2, 4].map((start) => (
          <View key={start} style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
            {statCards.slice(start, start + 2).map((card, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border, padding: 14 }}>
                <Text style={{ fontSize: 22, fontWeight: "800", color: card.color }}>{card.value}</Text>
                <Text style={{ fontSize: 11, color: c["muted-foreground"], marginTop: 2 }}>{card.label}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => setShowCreateAdmin(true)}
        style={{ marginHorizontal: 16, marginBottom: 16, height: 44, borderRadius: 12, backgroundColor: c.primary, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>+ Create Admin</Text>
      </TouchableOpacity>

      <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: c.foreground }}>Users</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 11, color: c["muted-foreground"] }}>{users.length} total</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
          <View style={{ flexDirection: "row", gap: 6, paddingRight: 16 }}>
            {[
              { key: null, label: "All Roles" },
              { key: "admin", label: "Admin" },
              { key: "recruiter", label: "Recruiter" },
              { key: "applicant", label: "Applicant" },
              { key: "hr_manager", label: "HR" },
            ].map((opt) => (
              <TouchableOpacity key={opt.label} onPress={() => setFilterRole(opt.key)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: filterRole === opt.key ? c.primary : c.card, borderWidth: 1, borderColor: filterRole === opt.key ? c.primary : c.border }}>
                <Text style={{ fontSize: 10, fontWeight: "600", color: filterRole === opt.key ? "#fff" : c["muted-foreground"] }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            {[
              { key: null, label: "All Status" },
              { key: "active", label: "Active" },
              { key: "banned", label: "Banned" },
              { key: "frozen", label: "Frozen" },
              { key: "flagged_for_review", label: "Flagged" },
            ].map((opt) => (
              <TouchableOpacity key={opt.label} onPress={() => setFilterStatus(opt.key)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: filterStatus === opt.key ? c.primary : c.card, borderWidth: 1, borderColor: filterStatus === opt.key ? c.primary : c.border }}>
                <Text style={{ fontSize: 10, fontWeight: "600", color: filterStatus === opt.key ? "#fff" : c["muted-foreground"] }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", gap: 6, paddingRight: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: c["muted-foreground"], lineHeight: 26 }}>Sort:</Text>
            {[
              { key: "name", label: "Name" },
              { key: "violations", label: "Violations" },
              { key: "status", label: "Status" },
            ].map((opt) => (
              <TouchableOpacity key={opt.key} onPress={() => setSortBy(opt.key)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: sortBy === opt.key ? c.primary : c.card, borderWidth: 1, borderColor: sortBy === opt.key ? c.primary : c.border }}>
                <Text style={{ fontSize: 10, fontWeight: "600", color: sortBy === opt.key ? "#fff" : c["muted-foreground"] }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={{ marginBottom: 10 }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or email..."
            placeholderTextColor={c["muted-foreground"]}
            style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontSize: 12, color: c.foreground }}
          />
        </View>

        {(() => {
          const q = search.toLowerCase();
          const filtered = users.filter((u) => {
            if (filterRole && u.role !== filterRole) return false;
            if (filterStatus && u.account_status !== filterStatus) return false;
            if (q && !(u.full_name || "").toLowerCase().includes(q) && !(u.email || "").toLowerCase().includes(q)) return false;
            return true;
          }).sort((a, b) => {
            if (sortBy === "name") return (a.full_name || "").localeCompare(b.full_name || "");
            if (sortBy === "violations") return (b.violationCount || 0) - (a.violationCount || 0);
            if (sortBy === "status") return (a.account_status || "").localeCompare(b.account_status || "");
            return 0;
          });
          return filtered.length === 0 ? (
            <Text style={{ fontSize: 12, color: c["muted-foreground"], textAlign: "center", padding: 20 }}>No users match filters.</Text>
          ) : (
            filtered.map((u) => {
              const statusColor = u.account_status === "banned" ? c.destructive : u.account_status === "frozen" ? c.warning : u.account_status === "flagged_for_review" ? c.warning : c.success;
              return (
                <TouchableOpacity
                  key={u.id}
                  onPress={() => { setSelectedUser(u); setShowActionDialog(true); }}
                  style={{ backgroundColor: c.card, borderRadius: 10, borderWidth: 1, borderColor: c.border, padding: 10, marginBottom: 6 }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${c.primary}20`, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: c.primary }}>{(u.full_name || "U")[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground }} numberOfLines={1}>{u.full_name || "Unknown"}</Text>
                        {u.account_status && (
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
                        )}
                      </View>
                      <Text style={{ fontSize: 10, color: c["muted-foreground"], marginTop: 1 }} numberOfLines={1}>{u.email}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <View style={{ backgroundColor: `${c.primary}12`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 9, fontWeight: "500", color: c.primary }}>{(u.role || "").replace("_", " ")}</Text>
                      </View>
                      {u.violationCount > 0 && (
                        <View style={{ backgroundColor: c.destructive, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 9, fontWeight: "700", color: "#fff" }}>{u.violationCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          );
        })()}
      </View>

      <UserActionDialog
        visible={showActionDialog}
        onClose={() => { setShowActionDialog(false); setSelectedUser(null); }}
        onSubmit={handleUserAction}
        user={selectedUser}
      />
      <CreateAdminDialog visible={showCreateAdmin} onClose={() => setShowCreateAdmin(false)} />
    </ScrollView>
  );
}

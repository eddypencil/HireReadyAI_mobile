import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { getReports, resolveReport } from "../services/admin.service";
import ReportResolveDialog from "../components/ReportResolveDialog";

const severityColors = {
  low: { colorKey: "muted-foreground", bgOpacity: "10" },
  medium: { colorKey: "warning", bgOpacity: "18" },
  high: { colorKey: "warning", bgOpacity: "30" },
  critical: { colorKey: "destructive", bgOpacity: "22" },
};

const statusTabs = ["pending", "resolved", "dismissed"];

export default function AdminReportsPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const navigation = useNavigation();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState("pending");
  const [filterSeverity, setFilterSeverity] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showResolve, setShowResolve] = useState(false);

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.warn("Load reports error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  }

  async function handleResolve(params) {
    await resolveReport(params);
    setShowResolve(false);
    setSelectedReport(null);
    await loadReports();
  }

  function handleNavigate(reportType, targetId) {
    setShowResolve(false);
    setSelectedReport(null);
    if (reportType === "user") {
      navigation.navigate("ApplicantProfile", { profileId: targetId, viewOnly: true });
    } else if (reportType === "company") {
      navigation.navigate("PublicCompanyProfile", { id: targetId });
    } else if (reportType === "job") {
      navigation.navigate("JobDetails", { id: targetId });
    }
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
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.foreground }}>Reports</Text>
        <Text style={{ fontSize: 13, color: c["muted-foreground"], marginTop: 2 }}>Manage user and company reports</Text>
      </View>

      <View style={{ flexDirection: "row", marginHorizontal: 16, marginBottom: 8, backgroundColor: c.muted, borderRadius: 10, padding: 2 }}>
        {statusTabs.map((st) => (
          <TouchableOpacity
            key={st}
            onPress={() => setFilterTab(st)}
            style={{ flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: filterTab === st ? c.card : "transparent", alignItems: "center" }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: filterTab === st ? c.foreground : c["muted-foreground"] }}>
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 16, marginBottom: 8, flexGrow: 0 }}>
        <View style={{ flexDirection: "row", gap: 5, paddingRight: 16 }}>
          {[
            { key: null, label: "All" },
            { key: "low", label: "Low" },
            { key: "medium", label: "Medium" },
            { key: "high", label: "High" },
            { key: "critical", label: "Critical" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.label}
              onPress={() => setFilterSeverity(opt.key)}
              style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, backgroundColor: filterSeverity === opt.key ? c.primary : c.card, borderWidth: 1, borderColor: filterSeverity === opt.key ? c.primary : c.border }}
            >
              <Text style={{ fontSize: 10, fontWeight: "600", color: filterSeverity === opt.key ? "#fff" : c["muted-foreground"] }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {(() => {
          const filtered = reports.filter((r) => {
            if (r.status !== filterTab) return false;
            if (filterSeverity === null) return true;
            return r.severity === filterSeverity;
          });
          return filtered.length === 0 ? (
            <Text style={{ fontSize: 12, color: c["muted-foreground"], textAlign: "center", padding: 32 }}>
              No {filterTab} reports.
            </Text>
          ) : (
            filtered.map((r) => {
              const sev = severityColors[r.severity] || severityColors.low;
              const sevColor = c[sev.colorKey];
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => { setSelectedReport(r); setShowResolve(true); }}
                  style={{ backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 8 }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: c.foreground }}>{r.subject}</Text>
                      <Text style={{ fontSize: 11, color: c["muted-foreground"], marginTop: 2 }}>
                        {r.reporter?.full_name || "Anonymous"} • {r.report_type || "report"}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: `${sevColor}22`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sevColor }} />
                      <Text style={{ fontSize: 10, fontWeight: "600", color: sevColor, textTransform: "capitalize" }}>{r.severity}</Text>
                    </View>
                  </View>
                  {r.description && (
                    <Text style={{ fontSize: 12, color: c["muted-foreground"], marginTop: 4 }} numberOfLines={2}>{r.description}</Text>
                  )}
                  <Text style={{ fontSize: 10, color: c["muted-foreground"], marginTop: 4 }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                  </Text>
                </TouchableOpacity>
              );
            })
          );
        })()}
        <View style={{ height: 32 }} />
      </ScrollView>

      <ReportResolveDialog
        visible={showResolve}
        onClose={() => { setShowResolve(false); setSelectedReport(null); }}
        onSubmit={handleResolve}
        report={selectedReport}
        onNavigate={handleNavigate}
      />
    </View>
  );
}

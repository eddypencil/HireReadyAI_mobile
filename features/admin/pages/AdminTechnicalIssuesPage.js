import { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { getTechnicalIssues, updateTechnicalIssueStatus } from "../services/admin.service";
import { supabase } from "../../../shared/services/supabase";

const statusTabs = ["pending", "in_progress", "resolved"];
const issueSeverityColors = {
  low: { bg: "#22c55e26", text: "#22c55e" },
  medium: { bg: "#eab30826", text: "#eab308" },
  high: { bg: "#f9731626", text: "#f97316" },
  critical: { bg: "#ef444426", text: "#ef4444" },
};

export default function AdminTechnicalIssuesPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState("open");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const channelRef = useRef(null);

  useEffect(() => { loadIssues(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`technical-issues-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "technical_issues" }, () => {
        loadIssues();
      })
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadIssues() {
    try {
      const data = await getTechnicalIssues();
      setIssues(data);
    } catch (err) {
      console.warn("Load issues error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadIssues();
    setRefreshing(false);
  }

  function openUpdate(issue) {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setResolutionNotes(issue.resolution_notes || "");
    setAssignedTo(issue.assigned_to || "");
    setShowModal(true);
  }

  async function handleUpdate() {
    if (!selectedIssue) return;
    setSubmitting(true);
    try {
      await updateTechnicalIssueStatus({
        id: selectedIssue.id,
        status: newStatus,
        resolutionNotes,
        assignedTo: assignedTo || null,
      });
      setShowModal(false);
      setSelectedIssue(null);
      await loadIssues();
    } catch (err) {
      console.warn("Update issue error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = issues.filter((i) => i.status === filterTab);

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
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.foreground }}>Technical Issues</Text>
        <Text style={{ fontSize: 13, color: c["muted-foreground"], marginTop: 2 }}>Track and resolve technical issues</Text>
      </View>

      <View style={{ flexDirection: "row", marginHorizontal: 16, marginBottom: 12, backgroundColor: c.muted, borderRadius: 12, padding: 3 }}>
        {statusTabs.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setFilterTab(t)}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: filterTab === t ? c.card : "transparent", alignItems: "center" }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: filterTab === t ? c.foreground : c["muted-foreground"] }}>
              {t === "in_progress" ? "In Progress" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.length === 0 ? (
          <Text style={{ fontSize: 12, color: c["muted-foreground"], textAlign: "center", padding: 32 }}>
            No {filterTab} issues.
          </Text>
        ) : (
          filtered.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              onPress={() => openUpdate(issue)}
              style={{ backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 8 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: c.foreground }}>{issue.title}</Text>
                  <Text style={{ fontSize: 11, color: c["muted-foreground"], marginTop: 2 }}>
                    {issue.issue_type || "issue"}
                  </Text>
                </View>
                <View style={{ backgroundColor: (issueSeverityColors[issue.severity] || issueSeverityColors.low).bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: "600", color: (issueSeverityColors[issue.severity] || issueSeverityColors.low).text }}>
                    {issue.severity || "low"}
                  </Text>
                </View>
              </View>
              {issue.description && (
                <Text style={{ fontSize: 12, color: c["muted-foreground"], marginTop: 4 }} numberOfLines={2}>{issue.description}</Text>
              )}
              <Text style={{ fontSize: 10, color: c["muted-foreground"], marginTop: 4 }}>
                {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : ""}
              </Text>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 }}>
          <ScrollView style={{ backgroundColor: c.card, borderRadius: 16, padding: 20, maxHeight: "80%" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: c.foreground, marginBottom: 4 }}>
              Update Issue
            </Text>
            <Text style={{ fontSize: 12, color: c["muted-foreground"], marginBottom: 16 }}>
              {selectedIssue?.title}
            </Text>

            <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground, marginBottom: 6 }}>Status</Text>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 16 }}>
              {statusTabs.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setNewStatus(s)}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                    backgroundColor: newStatus === s ? c.primary : c.muted,
                    borderWidth: 1, borderColor: newStatus === s ? c.primary : c.border,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "600", color: newStatus === s ? "#fff" : c["muted-foreground"] }}>
                    {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground, marginBottom: 6 }}>Resolution Notes</Text>
            <TextInput
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              placeholder="Notes..."
              placeholderTextColor={c["muted-foreground"]}
              multiline
              numberOfLines={3}
              style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: c.foreground, minHeight: 60, textAlignVertical: "top", marginBottom: 12 }}
            />

            <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground, marginBottom: 6 }}>Assigned To</Text>
            <TextInput
              value={assignedTo}
              onChangeText={setAssignedTo}
              placeholder="Name or email"
              placeholderTextColor={c["muted-foreground"]}
              style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: c.foreground, marginBottom: 16 }}
            />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.muted, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: c["muted-foreground"] }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdate} disabled={submitting} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.primary, justifyContent: "center", alignItems: "center", opacity: submitting ? 0.6 : 1 }}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>Update</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

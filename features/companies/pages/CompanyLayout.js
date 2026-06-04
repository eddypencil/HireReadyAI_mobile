import { useState, useEffect, useCallback, createContext, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";
import { useUser } from "../../auth/context/user.context";
import {
  fetchCompanyByProfileId,
  fetchJobsByCompanyId,
  fetchCompanyMembers,
} from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import NoCompanyView from "./NoCompanyView";

const CompanyContext = createContext(null);

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}

export function CompanyProvider({ children }) {
  const { loading: authLoading, profile } = useUser();
  const [jobs, setJobs] = useState([]);
  const [members, setMembers] = useState([]);
  const [company, setCompany] = useState(null);
  const [frameworkFile, setFrameworkFile] = useState("engineering-framework-v3.pdf");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanyData = useCallback(async () => {
    if (!profile?.id) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const companyData = await fetchCompanyByProfileId(profile.id);
      setCompany(companyData);
      if (companyData) {
        const [jobsData, membersData] = await Promise.all([
          fetchJobsByCompanyId(companyData.id),
          fetchCompanyMembers(companyData.id),
        ]);
        setJobs(jobsData);
        setMembers(membersData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleInviteMember = useCallback(async () => {
    if (!company?.id || !profile?.id) return;
    try {
      const newMember = await addMembership({
        company_id: company.id,
        profile_id: profile.id,
        permissions: { role: "recruiter" },
      });
      setMembers((prev) => [...prev, newMember]);
    } catch (err) {
      setError(err.message);
    }
  }, [company?.id, profile?.id]);

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!company && !loading) {
    return <NoCompanyView onCompanyJoined={() => fetchCompanyData()} />;
  }

  return (
    <CompanyContext.Provider
      value={{
        company,
        jobs,
        members,
        frameworkFile,
        setFrameworkFile,
        onInvite: handleInviteMember,
        loading,
        reload: fetchCompanyData,
      }}
    >
      {loading ? (
        <View style={styles.centered}>
      <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        children
      )}
    </CompanyContext.Provider>
  );
}

export default function CompanyLayout() {
  const navigation = useNavigation();
  const { company, jobs, members, frameworkFile, setFrameworkFile, loading } = useCompany();

  if (loading || !company) return null;

  const links = [
    { to: "CompanyProfile", label: "Company Profile", icon: "business", params: { company, members, onInvite: () => {}, frameworkFile, setFrameworkFile } },
    { to: "JDGenerator", label: "JD Generator", icon: "sparkles", params: { company } },
    { to: "JobPostings", label: "Job Postings", icon: "briefcase", params: { jobs, searchQuery: "" } },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back</Text>
        <Text style={styles.companyName}>{company.name}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{jobs.length}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{members.length}</Text>
          <Text style={styles.statLabel}>Team Members</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Manage</Text>
      {links.map((link) => (
        <TouchableOpacity
          key={link.to}
          style={styles.navCard}
          onPress={() => navigation.navigate(link.to)}
          activeOpacity={0.7}
        >
          <View style={styles.navIconWrap}>
            <Ionicons name={link.icon} size={22} color={colors.primary} />
          </View>
          <View style={styles.navTextWrap}>
            <Text style={styles.navLabel}>{link.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  loadingText: { marginTop: 8, fontSize: 13, color: colors.gray[500] },
  errorContainer: { padding: 24 },
  errorText: { color: colors.red[500], fontSize: 14 },
  header: { marginBottom: 24 },
  welcome: { fontSize: 14, color: colors.gray[500] },
  companyName: { fontSize: 26, fontWeight: "700", color: colors.foreground, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  statNumber: { fontSize: 28, fontWeight: "800", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.gray[600], textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  navCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  navIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center" },
  navTextWrap: { flex: 1, marginLeft: 14 },
  navLabel: { fontSize: 15, fontWeight: "600", color: colors.gray[900] },
});

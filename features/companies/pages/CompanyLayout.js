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
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useUser } from "../../auth/context/user.context";
import {
  fetchCompanyByProfileId,
  fetchJobsByCompanyId,
  fetchCompanyMembers,
} from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { MEMBERSHIP_PERMISSION } from "../../../shared/constants/enums";
import NoCompanyView from "./NoCompanyView";
import PendingApprovalPage from "./PendingApprovalPage";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const CompanyContext = createContext(null);

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}

export function CompanyProvider({ children }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const { loading: authLoading, profile } = useUser();
  const [jobs, setJobs] = useState([]);
  const [members, setMembers] = useState([]);
  const [company, setCompany] = useState(null);
  const [permission, setPermission] = useState(null);
  const [frameworkFile, setFrameworkFile] = useState("engineering-framework-v3.pdf");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanyData = useCallback(async () => {
    if (!profile?.id) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const { company: companyData, permission: perm } = await fetchCompanyByProfileId(profile.id);
      setCompany(companyData);
      setPermission(perm);
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
        recruiter_permissions: MEMBERSHIP_PERMISSION.pending,
      });
      setMembers((prev) => [...prev, newMember]);
    } catch (err) {
      setError(err.message);
    }
  }, [company?.id, profile?.id]);

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={c.primary} />
        <Text style={styles.loadingText}>{t("companies.loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!company && !loading) {
    return <NoCompanyView onCompanyJoined={() => fetchCompanyData()} />;
  }

  if (permission === MEMBERSHIP_PERMISSION.pending) {
    return <PendingApprovalPage companyName={company?.name} />;
  }

  return (
    <CompanyContext.Provider
      value={{
        company,
        permission,
        jobs,
        members,
        permission,
        frameworkFile,
        setFrameworkFile,
        onInvite: handleInviteMember,
        onMembersChange: setMembers,
        onCompanyUpdate: setCompany,
        loading,
        error,
        reload: fetchCompanyData,
      }}
    >
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={c.primary} />
        </View>
      ) : (
        children
      )}
    </CompanyContext.Provider>
  );
}

export default function CompanyLayout() {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const navigation = useNavigation();
  const { company, jobs, members, frameworkFile, setFrameworkFile, loading } = useCompany();
  const insets = useSafeAreaInsets();

  if (loading || !company) return null;

  const links = [
    { to: "CompanyProfile", label: t("companies.company_profile"), icon: "business", params: { company, members, onInvite: () => {}, frameworkFile, setFrameworkFile } },
    { to: "JDGenerator", label: t("companies.jd_generator"), icon: "sparkles", params: { company } },
    { to: "JobPostings", label: t("companies.job_postings"), icon: "briefcase", params: { jobs, searchQuery: "" } },
  ];

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.welcome}>{t("companies.welcome_back")}</Text>
        <Text style={styles.companyName}>{company.name}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{jobs.length}</Text>
          <Text style={styles.statLabel}>{t("companies.active_jobs")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{members.length}</Text>
          <Text style={styles.statLabel}>{t("companies.team_members")}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("companies.manage")}</Text>
      {links.map((link) => (
        <TouchableOpacity
          key={link.to}
          style={styles.navCard}
          onPress={() => navigation.navigate(link.to)}
          activeOpacity={0.7}
        >
          <View style={styles.navIconWrap}>
            <Ionicons name={link.icon} size={22} color={c.primary} />
          </View>
          <View style={styles.navTextWrap}>
            <Text style={styles.navLabel}>{link.label}</Text>
          </View>
          <Ionicons name={language === 'ar' ? 'chevron-back' : 'chevron-forward'} size={18} color={c['muted-foreground']} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.gray[50] },
    content: { padding: 20 },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.white },
    loadingText: { marginTop: 8, fontSize: 13, color: c.gray[500] },
    errorText: { color: c.red[500], fontSize: 14, textAlign: "center" },
    header: { marginBottom: 24 },
    welcome: { fontSize: 14, color: c.gray[500] },
    companyName: { fontSize: 26, fontWeight: '700', color: c.foreground, marginTop: 2 },
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
    statCard: { flex: 1, backgroundColor: c.white, borderRadius: 14, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    statNumber: { fontSize: 28, fontWeight: '800', color: c.primary },
    statLabel: { fontSize: 12, color: c.gray[500], marginTop: 2 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: c.gray[600], textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
    navCard: { flexDirection: "row", alignItems: "center", backgroundColor: c.white, borderRadius: 12, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
    navIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: c.surface, justifyContent: "center", alignItems: "center" },
    navTextWrap: { flex: 1, marginLeft: 14 },
    navLabel: { fontSize: 15, fontWeight: '600', color: c.gray[900] },
  });
}

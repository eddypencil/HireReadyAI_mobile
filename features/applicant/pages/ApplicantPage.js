import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../../auth/context/user.context";
import { fetchApplicationsByApplicantId } from "../../applications/services/application.service";
import ApplicantHeader from "../components/ApplicantHeader";
import StatsCards from "../components/StatsCards";
import ChartsSection from "../components/ChartsSection";
import ApplicationsList from "../components/ApplicationsList";
import InterviewList from "../components/InterviewList";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { spacing } from "../../../src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApplicantPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { profile, user, setProfile } = useUser();
  const navigation = useNavigation();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const s = {
    container: { flex: 1, backgroundColor: c['surface-muted'] },
    content: { padding: 20, gap: 20, paddingBottom: 40 },
    centered: { flex: 1, backgroundColor: c['surface-muted'], alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
    errorText: { color: c.destructive, fontSize: 13, textAlign: "center", padding: 20 },
    loadingText: { fontSize: 14, color: c['muted-foreground'], marginTop: 4 },
    retryBtn: { backgroundColor: c.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, marginTop: 4 },
    retryText: { color: c['destructive-foreground'], fontSize: 14, fontWeight: "600" },
    emptyCard: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 36, alignItems: "center", gap: 10, maxWidth: 320 },
    emptyIconBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: c['surface-muted'], alignItems: "center", justifyContent: "center", marginBottom: 4 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: c.foreground, textAlign: "center" },
    emptySubtitle: { fontSize: 13, color: c['muted-foreground'], textAlign: "center", lineHeight: 20, maxWidth: 260 },
    browseBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 6 },
    browseBtnText: { color: c['destructive-foreground'], fontSize: 14, fontWeight: "600" },
  };

  const loadApplications = () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    fetchApplicationsByApplicantId(user.id)
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadApplications(); }, [user?.id]);

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={s.loadingText}>{t("applicant.loading_applications")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.centered}>
        <Ionicons name="alert-circle-outline" size={40} color={c.destructive} />
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={loadApplications}>
          <Text style={s.retryText}>{t("applicant.try_again")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (applications.length === 0) {
    return (
      <View style={s.centered}>
        <View style={s.emptyCard}>
          <View style={s.emptyIconBox}>
            <Ionicons name="briefcase-outline" size={32} color={c.border} />
          </View>
          <Text style={s.emptyTitle}>{t("applicant.no_applications")}</Text>
          <Text style={s.emptySubtitle}>{t("applicant.browse_jobs_subtitle")}</Text>
          <TouchableOpacity
            style={s.browseBtn}
            onPress={() => navigation.navigate("JobsTab")}
            activeOpacity={0.85}
          >
            <Ionicons name="search-outline" size={15} color={c['destructive-foreground']} />
            <Text style={s.browseBtnText}>{t("applicant.browse_jobs")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={s.content}>
      <ApplicantHeader
        fullName={profile?.full_name}
        profile_pic={profile?.profile_pic}
        email={profile?.email || user?.email}
        phone={profile?.phone}
        joinedDate={profile?.created_at}
        userId={user?.id}
        onAvatarChange={(url) =>
          setProfile((prev) => ({ ...prev, profile_pic: url }))
        }
      />

      <StatsCards applications={applications} />
      <ChartsSection applications={applications} />
      <ApplicationsList
        applications={applications}
        onViewJob={(jobId) => navigation.navigate("JobDetails", { id: jobId })}
      />
      <InterviewList applications={applications} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

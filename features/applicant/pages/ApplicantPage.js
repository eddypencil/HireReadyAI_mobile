import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../../auth/context/user.context";
import { fetchApplicationsByApplicantId } from "../../applications/services/application.service";
import ApplicantHeader from "../components/ApplicantHeader";
import StatsCards from "../components/StatsCards";
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
  const { profile, user } = useUser();
  const navigation = useNavigation();
  const [localProfile, setLocalProfile] = useState(profile);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { setLocalProfile(profile); }, [profile]);

  useEffect(() => {
    if (user?.id) {
      setLoading(true); setError(null);
      fetchApplicationsByApplicantId(user.id)
        .then(setApplications)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const s = {
    container: { flex: 1, backgroundColor: c['surface-muted'] },
    content: { padding: 20, gap: 20, paddingBottom: 40 },
    centered: { flex: 1, backgroundColor: c['surface-muted'], alignItems: "center", justifyContent: "center" },
    errorText: { color: c.destructive, fontSize: 13, textAlign: "center", padding: 20 },
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={s.content}>
      <ApplicantHeader
        fullName={localProfile?.full_name}
        profile_pic={localProfile?.profile_pic}
        email={localProfile?.email || user?.email}
        phone={localProfile?.phone}
        joinedDate={localProfile?.created_at}
        userId={user?.id}
        onAvatarChange={(url) =>
          setLocalProfile((prev) => ({ ...prev, profile_pic: url }))
        }
      />

      <StatsCards applications={applications} />

      <ApplicationsList
        applications={applications}
        onViewJob={(jobId) => navigation.navigate("JobDetails", { id: jobId })}
      />

      <InterviewList applications={applications} />
    </ScrollView>
  );
}

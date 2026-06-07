import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../../auth/context/user.context";
import { fetchApplicationsByApplicantId } from "../../applications/services/application.service";
import ApplicantHeader from "../components/ApplicantHeader";
import StatsCards from "../components/StatsCards";
import ApplicationsList from "../components/ApplicationsList";
import InterviewList from "../components/InterviewList";
import { colors } from "../../../src/theme";

export default function ApplicantPage() {
  const { profile, user } = useUser();
  const navigation = useNavigation();
  const [localProfile, setLocalProfile] = useState(profile);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      setError(null);
      fetchApplicationsByApplicantId(user.id)
        .then(setApplications)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: colors.red[600],
    fontSize: 13,
    textAlign: "center",
    padding: 20,
  },
});
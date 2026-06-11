// features/applicant/pages/ApplicantPage.js
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator,
  StyleSheet, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../auth/context/user.context';
import { fetchApplicationsByApplicantId } from '../../applications/services/application.service';
import { colors } from '../../../src/theme';

import StatsCards from '../components/StatsCards';
import ChartsSection from '../components/ChartsSection';
import ApplicationsList from '../components/ApplicationsList';
import InterviewList from '../components/InterviewList';

export default function ApplicantPage() {
  const { user } = useUser();
  const navigation = useNavigation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // ── Loading
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your applications...</Text>
      </View>
    );
  }

  // ── Error
  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.red[400]} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadApplications}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Empty state
  if (applications.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="briefcase-outline" size={32} color={colors.border} />
          </View>
          <Text style={styles.emptyTitle}>No applications yet</Text>
          <Text style={styles.emptySubtitle}>
            Start exploring jobs and apply to kick off your journey
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('JobsTab')}
            activeOpacity={0.85}
          >
            <Ionicons name="search-outline" size={15} color={colors.white} />
            <Text style={styles.browseBtnText}>Browse Jobs</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Full dashboard
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatsCards applications={applications} />
      <ChartsSection applications={applications} />
      <ApplicationsList
        applications={applications}
        onViewJob={(jobId) => navigation.navigate('JobDetails', { id: jobId })}
      />
      <InterviewList applications={applications} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.red[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 36,
    alignItems: 'center',
    gap: 10,
    maxWidth: 320,
    shadowColor: colors.primary,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  browseBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
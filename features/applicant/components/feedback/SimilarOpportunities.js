// features/applicant/components/feedback/SimilarOpportunities.js
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../../src/theme';
import { fetchSimilarJobs } from '../../../jobs/services/jobs.service';

export default function SimilarOpportunities({ jobId, seniorityLevel, jobType }) {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (!jobId) return;
    fetchSimilarJobs(jobId, seniorityLevel || '', jobType || '')
      .then(setJobs).catch(() => {});
  }, [jobId]);

  if (jobs.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="briefcase-outline" size={14} color={colors.primary} />
        </View>
        <Text style={styles.heading}>Similar Opportunities</Text>
      </View>
      {jobs.slice(0, 3).map((job, idx, arr) => {
        const company = job.companies;
        const isLast = idx === arr.length - 1;
        return (
          <TouchableOpacity
            key={job.id}
            style={[styles.row, isLast && styles.rowLast]}
            onPress={() => navigation.navigate('JobDetails', { jobId: job.id })}
            activeOpacity={0.75}
          >
            <View style={styles.logo}>
              <Text style={styles.logoText}>{company?.name?.[0] || '?'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
              <View style={styles.meta}>
                {company?.name && (
                  <View style={styles.metaItem}>
                    <Ionicons name="business-outline" size={10} color={colors.muted} />
                    <Text style={styles.metaText}>{company.name}</Text>
                  </View>
                )}
                {company?.location && (
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={10} color={colors.secondary} />
                    <Text style={[styles.metaText, { color: colors.secondary }]}>{company.location}</Text>
                  </View>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.gray[300]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white, borderRadius: 18,
    borderWidth: 1, borderColor: colors.line, padding: 18,
    shadowColor: colors.primary, shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  iconWrap: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: colors.accentSoftBg,
    alignItems: 'center', justifyContent: 'center',
  },
  heading: { fontSize: 14, fontWeight: '700', color: colors.ink },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  rowLast: { borderBottomWidth: 0 },
  logo: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.accentSoftBg,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  logoText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  info: { flex: 1 },
  jobTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 3 },
  meta: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: colors.muted },
});

import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchJobById, fetchSimilarJobs } from '../services/jobs.service';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
import { useUser } from '../../auth/context/user.context';
import { supabase } from '../../../shared/services/supabase';
import { fontSize, fontWeight } from '../../../src/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatJobType(type) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function JobDetailsPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { profile } = useUser();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    async function loadJob() {
      try {
        const data = await fetchJobById(id);
        setJob(data);
        const similar = await fetchSimilarJobs(id, data.seniority_level, data.job_type);
        setSimilarJobs(similar || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  useEffect(() => {
    if (!id || !profile?.id) return;
    async function checkApplication() {
      const { data } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', id)
        .eq('candidate_profile_id', profile.id)
        .maybeSingle();
      setHasApplied(!!data);
    }
    checkApplication();
  }, [id, profile?.id]);

  const s = {
    screen: { flex: 1, backgroundColor: c['surface-muted'] },
    contentContainer: { padding: 16, paddingBottom: 40, gap: 12 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c['surface-muted'] },
    statusText: { marginTop: 12, color: c['muted-foreground'], fontSize: 15 },
    card: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 20 },
    companyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    companyLogo: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: c.border, resizeMode: 'contain' },
    companyLogoPlaceholder: { width: 44, height: 44, borderRadius: 10, backgroundColor: c['surface-muted'], alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border },
    companyLogoText: { fontSize: 18, color: c.primary, fontWeight: '700' },
    companyName: { fontSize: 15, color: c.foreground, fontWeight: '600' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
    companyLocation: { fontSize: 12, color: c['muted-foreground'] },
    jobTitle: { fontSize: 22, color: c.foreground, marginBottom: 12, lineHeight: 30, fontWeight: '700' },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: c['surface-muted'], borderWidth: 1, borderColor: c.border },
    tagText: { fontSize: 12, color: c.accent, fontWeight: '500' },
    salaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    salaryText: { fontSize: fontSize.sm, color: c.primary, fontWeight: '600' },
    salaryConfidential: { fontSize: fontSize.sm, color: c['muted-foreground'] },
    actions: { flexDirection: 'row', gap: 10 },
    applyButton: { flex: 1, backgroundColor: c.primary, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    applyButtonDisabled: { backgroundColor: c['muted-foreground'] },
    applyButtonText: { color: c['destructive-foreground'], fontSize: 15, fontWeight: '600' },
    bookmarkButton: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 16, color: c.foreground, marginBottom: 12, fontWeight: '700' },
    bodyText: { fontSize: fontSize.sm, color: c['muted-foreground'], lineHeight: 22 },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.accent, marginTop: 8, marginRight: 10, flexShrink: 0 },
    bulletText: { fontSize: fontSize.sm, color: c['muted-foreground'], lineHeight: 22, flex: 1 },
    skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillTag: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: c['surface-muted'], borderWidth: 1, borderColor: c.border },
    skillTagText: { fontSize: 13, color: c.accent, fontWeight: '500' },
    similarJobItem: { paddingVertical: 12 },
    similarJobBorder: { borderBottomWidth: 1, borderBottomColor: c.border },
    similarJobRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    similarJobLogo: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: c.border, resizeMode: 'contain' },
    similarJobLogoPlaceholder: { width: 44, height: 44, borderRadius: 10, backgroundColor: c['surface-muted'], alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border },
    similarJobLogoText: { fontSize: 16, color: c.primary, fontWeight: '700' },
    similarJobTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    similarJobTitle: { fontSize: fontSize.sm, color: c.foreground, flex: 1, fontWeight: '600' },
    similarJobMeta: { fontSize: 12, color: c['muted-foreground'], marginTop: 3 },
    similarJobTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    similarTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: c['surface-muted'], borderWidth: 1, borderColor: c.border },
    similarTagText: { fontSize: 11, color: c.accent, fontWeight: '500' },
    similarJobDate: { fontSize: 11, color: c['muted-foreground'], marginTop: 6 },
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={s.statusText}>{t('job_details.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.centered}>
        <Text style={[s.statusText, { color: c.destructive }]}>{t('job_details.error')}: {error}</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={s.centered}>
        <Text style={s.statusText}>{t('job_details.not_found')}</Text>
      </View>
    );
  }

  const company = job.companies;

  return (
    <ScrollView style={[s.screen, { paddingTop: insets.top }]} contentContainerStyle={s.contentContainer}>
      <View style={s.card}>
        <View style={s.companyRow}>
          {company?.logo_url ? (
            <Image source={{ uri: company.logo_url }} style={s.companyLogo} />
          ) : (
            <View style={s.companyLogoPlaceholder}>
              <Text style={s.companyLogoText}>{company?.name?.[0] || '?'}</Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={s.companyName}>{company?.name}</Text>
            {company?.location && (
              <View style={s.locationRow}>
                <Ionicons name="location-outline" size={12} color={c['muted-foreground']} />
                <Text style={s.companyLocation}>{company.location}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={s.jobTitle}>{job.title}</Text>

        <View style={s.tags}>
          {job.job_type && (
            <View style={s.tag}>
              <Text style={s.tagText}>{formatJobType(job.job_type)}</Text>
            </View>
          )}
          {job.seniority_level && (
            <View style={s.tag}>
              <Text style={[s.tagText, { textTransform: 'capitalize' }]}>{job.seniority_level}</Text>
            </View>
          )}
          {job.work_location && (
            <View style={s.tag}>
              <Text style={[s.tagText, { textTransform: 'capitalize' }]}>{job.work_location.replace('_', '-')}</Text>
            </View>
          )}
        </View>

        {(job.salary_min && job.salary_max) ? (
          <View style={s.salaryRow}>
            <Ionicons name="cash-outline" size={14} color={c.primary} />
            <Text style={s.salaryText}>
              {t('job_details.salary')}: {job.salary_min.toLocaleString()} – {job.salary_max.toLocaleString()} EGP
            </Text>
          </View>
        ) : (
          <View style={s.salaryRow}>
            <Ionicons name="cash-outline" size={14} color={c['muted-foreground']} />
            <Text style={s.salaryConfidential}>{t('job_details.salary_confidential')}</Text>
          </View>
        )}

        <View style={s.actions}>
          <TouchableOpacity
            style={[s.applyButton, hasApplied && s.applyButtonDisabled]}
            activeOpacity={hasApplied ? 1 : 0.8}
            onPress={() => {
              if (hasApplied) return;
              navigation.navigate('Apply', { jobId: job.id });
            }}
          >
            <Text style={s.applyButtonText}>
              {hasApplied ? t('job_details.applied') : t('job_details.apply_now')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>{t('job_details.about_role')}</Text>
        <Text style={s.bodyText}>{job.description}</Text>
      </View>

      {job.requirements?.length > 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>{t('job_details.qualifications')}</Text>
          {job.requirements.map((item, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={s.bullet} />
              <Text style={s.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {job.responsibilities?.length > 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>{t('job_details.responsibilities')}</Text>
          {job.responsibilities.map((item, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={s.bullet} />
              <Text style={s.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {job.skills?.length > 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>{t('job_details.skills')}</Text>
          <View style={s.skillsWrap}>
            {job.skills.map((skill, i) => (
              <View key={i} style={s.skillTag}>
                <Text style={s.skillTagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {similarJobs.length > 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>{t('job_details.similar_jobs')}</Text>
          {similarJobs.map((sj, i) => (
            <TouchableOpacity
              key={sj.id}
              style={[s.similarJobItem, i < similarJobs.length - 1 && s.similarJobBorder]}
              onPress={() => navigation.replace('JobDetails', { id: sj.id })}
              activeOpacity={0.7}
            >
              <View style={s.similarJobRow}>
                {sj.companies?.logo_url ? (
                  <Image source={{ uri: sj.companies.logo_url }} style={s.similarJobLogo} />
                ) : (
                  <View style={s.similarJobLogoPlaceholder}>
                    <Text style={s.similarJobLogoText}>{sj.companies?.name?.[0] || '?'}</Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <View style={s.similarJobTitleRow}>
                    <Text style={s.similarJobTitle} numberOfLines={1}>{sj.title}</Text>
                  </View>
                  <Text style={s.similarJobMeta} numberOfLines={1}>
                    {sj.companies?.name}{sj.companies?.location && ` • ${sj.companies.location}`}
                  </Text>
                  <View style={s.similarJobTags}>
                    {sj.job_type && (
                      <View style={s.similarTag}>
                        <Text style={s.similarTagText}>{formatJobType(sj.job_type)}</Text>
                      </View>
                    )}
                    {sj.seniority_level && (
                      <View style={s.similarTag}>
                        <Text style={[s.similarTagText, { textTransform: 'capitalize' }]}>{sj.seniority_level}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.similarJobDate}>
                    {new Date(sj.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

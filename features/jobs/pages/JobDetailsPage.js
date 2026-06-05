import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchJobById, fetchSimilarJobs } from '../services/jobs.service';
import { colors } from '../../../src/theme';

function formatJobType(type) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function JobDetailsPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.statusText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.statusText, { color: colors.red[500] }]}>Error: {error}</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Job not found</Text>
      </View>
    );
  }

  const company = job.companies;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>

      
      <View style={styles.card}>

        
        <View style={styles.companyRow}>
          
          {company?.logo_url ? (
            <Image source={{ uri: company.logo_url }} style={styles.companyLogo} />
          ) : (
            <View style={styles.companyLogoPlaceholder}>
              <Text style={styles.companyLogoText}>{company?.name?.[0] || '?'}</Text>
            </View>
          )}
          
          <View style={{ flex: 1 }}>
            <Text style={styles.companyName}>{company?.name}</Text>
            {company?.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
                <Text style={styles.companyLocation}>{company.location}</Text>
              </View>
            )}  
          </View>
          <TouchableOpacity style={styles.bookmarkButton} onPress={() => {}}>
            <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>


        <Text style={styles.jobTitle}>{job.title}</Text>

        
        <View style={styles.tags}>
          {job.job_type && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{formatJobType(job.job_type)}</Text>
            </View>
          )}
          {job.seniority_level && (
            <View style={styles.tag}>
              <Text style={[styles.tagText, { textTransform: 'capitalize' }]}>
                {job.seniority_level}
              </Text>
            </View>
          )}
          {/* {job.experience_years && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.experience_years}</Text>
            </View>
          )} */}
          {job.work_location && (
            <View style={styles.tag}>
              <Text style={[styles.tagText, { textTransform: 'capitalize' }]}>
                {job.work_location.replace('_', '-')}
              </Text>
            </View>
          )}
        </View>

        
        {(job.salary_min && job.salary_max) ? (
          <View style={styles.salaryRow}>
            <Ionicons name="cash-outline" size={14} color={colors.primary} />
            <Text style={styles.salaryText}>
              Salary: {job.salary_min.toLocaleString()} – {job.salary_max.toLocaleString()} EGP
            </Text>
          </View>
        ) : (
          <View style={styles.salaryRow}>
            <Ionicons name="cash-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.salaryText, { color: colors.mutedForeground }]}>Salary: Confidential</Text>
          </View>
        )}

        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.applyButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Apply', { jobId: job.id })}
          >
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>

          
        </View>
      </View>

      {/* ── About this role ── */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About this role</Text>
        <Text style={styles.bodyText}>{job.description}</Text>
      </View>

      {/* ── Qualifications ── */}
      {job.requirements?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Qualifications</Text>
          {job.requirements.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      
      {job.responsibilities?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Responsibilities</Text>
          {job.responsibilities.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      
      {job.skills?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Skills & Tools</Text>
          <View style={styles.skillsWrap}>
            {job.skills.map((skill, i) => (
              <View key={i} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      
      {similarJobs.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Similar Jobs</Text>
          {similarJobs.map((sj, i) => (
            <TouchableOpacity
              key={sj.id}
              style={[styles.similarJobItem, i < similarJobs.length - 1 && styles.similarJobBorder]}
              onPress={() => navigation.replace('JobDetails', { id: sj.id })}
              activeOpacity={0.7}
            >
              <View style={styles.similarJobRow}>
                {sj.companies?.logo_url ? (
                  <Image source={{ uri: sj.companies.logo_url }} style={styles.similarJobLogo} />
                ) : (
                  <View style={styles.similarJobLogoPlaceholder}>
                    <Text style={styles.similarJobLogoText}>
                      {sj.companies?.name?.[0] || '?'}
                    </Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <View style={styles.similarJobTitleRow}>
                    <Text style={styles.similarJobTitle} numberOfLines={1}>
                      {sj.title}
                    </Text>
                    <TouchableOpacity onPress={() => {}} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="bookmark-outline" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.similarJobMeta} numberOfLines={1}>
                    {sj.companies?.name}{sj.companies?.location && ` • ${sj.companies.location}`}
                  </Text>

                  <View style={styles.similarJobTags}>
                    {sj.job_type && (
                      <View style={styles.similarTag}>
                        <Text style={styles.similarTagText}>{formatJobType(sj.job_type)}</Text>
                      </View>
                    )}
                    {sj.seniority_level && (
                      <View style={styles.similarTag}>
                        <Text style={[styles.similarTagText, { textTransform: 'capitalize' }]}>
                          {sj.seniority_level}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.similarJobDate}>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  statusText: {
    marginTop: 12,
    color: colors.gray[500],
    fontSize: 15,
  },

  
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },

  
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    resizeMode: 'contain',
  },
  companyLogoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  companyLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  companyLocation: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 12,
    lineHeight: 30,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '500',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  salaryText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Sections ──
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 8,
    marginRight: 10,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 22,
    flex: 1,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillTagText: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '500',
  },

  // ── Similar jobs ──
  similarJobItem: {
    paddingVertical: 12,
  },
  similarJobBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  similarJobRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  similarJobLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    resizeMode: 'contain',
  },
  similarJobLogoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  similarJobLogoText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  similarJobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  similarJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    flex: 1,
  },
  similarJobMeta: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 3,
  },
  similarJobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  similarTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  similarTagText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '500',
  },
  similarJobDate: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 6,
  },
});
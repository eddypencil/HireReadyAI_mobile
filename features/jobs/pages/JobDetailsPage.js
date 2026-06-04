import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, Alert, Linking,
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
        <ActivityIndicator size="large" color={colors.darkAmethyst[600]} />
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
      <View style={styles.mainGrid}>
        <View style={styles.mainContent}>
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.jobTitle}>{job.title}</Text>

              <View style={styles.titleActions}>
                <TouchableOpacity
                  style={styles.applyButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bookmarkCircle}
                  onPress={() => {}}
                >
                  <Ionicons name="heart-outline" size={18} color={colors.darkAmethyst[600]} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.companyRow}>
              {company?.logo_url ? (
                <Image source={{ uri: company.logo_url }} style={styles.companyLogo} />
              ) : (
                <View style={styles.companyLogoPlaceholder}>
                  <Text style={styles.companyLogoText}>
                    {company?.name?.[0] || '?'}
                  </Text>
                </View>
              )}
              <Text style={styles.companyName}>{company?.name}</Text>
              {company?.location && (
                <>
                  <Text style={styles.dot}>  •  </Text>
                  <Ionicons name="location-outline" size={13} color={colors.darkAmethyst[600]} />
                  <Text style={styles.companyLocation}>  {company.location}</Text>
                </>
              )}
            </View>

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
              {job.experience_years && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{job.experience_years}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About this role</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </View>

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
        </View>

        <View style={styles.sidebar}>
          {similarJobs.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sidebarTitle}>Similar Jobs</Text>
              {similarJobs.map(sj => (
                <TouchableOpacity
                  key={sj.id}
                  style={styles.similarJobItem}
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

                    <View style={styles.similarJobInfo}>
                      <View style={styles.similarJobTitleRow}>
                        <Text style={styles.similarJobTitle} numberOfLines={1}>
                          {sj.title}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {}}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="heart-outline" size={14} color={colors.darkAmethyst[300]} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.similarJobMeta} numberOfLines={1}>
                        {sj.companies?.name}
                        {sj.companies?.location && `  •  ${sj.companies.location}`}
                      </Text>

                      <View style={styles.similarJobTags}>
                        {sj.job_type && (
                          <View style={styles.similarTag}>
                            <Text style={styles.similarTagText}>
                              {formatJobType(sj.job_type)}
                            </Text>
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
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.darkAmethyst[50],
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkAmethyst[50],
  },
  statusText: {
    marginTop: 12,
    color: colors.gray[500],
    fontSize: 15,
  },
  mainGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  mainContent: {
    flex: 2,
    gap: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.darkAmethyst[950],
    flex: 1,
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.darkAmethyst[600],
    shadowColor: colors.darkAmethyst[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  bookmarkCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    resizeMode: 'contain',
    padding: 1,
  },
  companyLogoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.darkAmethyst[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogoText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkAmethyst[600],
  },
  companyName: {
    fontSize: 14,
    color: colors.darkAmethyst[600],
    fontWeight: '500',
    marginLeft: 8,
  },
  dot: {
    color: colors.darkAmethyst[300],
    fontSize: 12,
    marginHorizontal: 2,
  },
  companyLocation: {
    fontSize: 14,
    color: colors.darkAmethyst[500],
    marginLeft: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.darkAmethyst[50],
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
  },
  tagText: {
    fontSize: 12,
    color: colors.darkAmethyst[700],
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkAmethyst[950],
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.darkAmethyst[700],
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.darkAmethyst[400],
    marginTop: 7,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 14,
    color: colors.darkAmethyst[700],
    lineHeight: 20,
    flex: 1,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.darkAmethyst[50],
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
  },
  skillTagText: {
    fontSize: 14,
    color: colors.darkAmethyst[700],
  },
  sidebar: {
    flex: 1,
    gap: 16,
  },
  sidebarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkAmethyst[950],
    marginBottom: 12,
  },
  similarJobItem: {
    marginBottom: 16,
  },
  similarJobRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  similarJobLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    resizeMode: 'contain',
    padding: 1,
  },
  similarJobLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.darkAmethyst[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  similarJobLogoText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkAmethyst[600],
  },
  similarJobInfo: {
    flex: 1,
    minWidth: 0,
  },
  similarJobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
  },
  similarJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkAmethyst[900],
    flex: 1,
  },
  similarJobMeta: {
    fontSize: 11,
    color: colors.darkAmethyst[400],
    marginTop: 2,
  },
  similarJobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  similarTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.darkAmethyst[50],
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
  },
  similarTagText: {
    fontSize: 10,
    color: colors.darkAmethyst[600],
    fontWeight: '500',
  },
});

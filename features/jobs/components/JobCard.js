import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme';

function formatRelativeTime(dateString) {
  const now = new Date();
  const posted = new Date(dateString);
  const diffMs = now - posted;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatJobType(type) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function JobCard({ job }) {
  const navigation = useNavigation();
  const company = job.companies;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('JobDetails', { id: job.id })}
      activeOpacity={0.8}
    >
      <View style={styles.innerRow}>
        <View style={styles.leftSection}>
          {company?.logo_url ? (
            <Image source={{ uri: company.logo_url }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>
                {company?.name?.[0] || '?'}
              </Text>
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {job.title}
            </Text>

            <View style={styles.companyRow}>
              {company?.name && (
                <Text style={styles.companyName}>{company.name}</Text>
              )}
              {company?.location && (
                <>
                  <Text style={styles.separator}>  •  </Text>
                  <Text style={styles.location}>{company.location}</Text>
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
                  <Text style={styles.tagText}>
                    {job.seniority_level.charAt(0).toUpperCase() + job.seniority_level.slice(1)}
                  </Text>
                </View>
              )}
              {job.work_location && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {job.work_location.replace(/_/g, '-')}
                  </Text>
                </View>
              )}
              {job.salary_min != null && job.salary_max != null && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {Number(job.salary_min).toLocaleString()} – {Number(job.salary_max).toLocaleString()} EGP
                  </Text>
                </View>
              )}
            </View>

            {job.responsibilities?.length > 0 && (
              <View style={styles.responsibilities}>
                {job.responsibilities.slice(0, 2).map((item, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText} numberOfLines={1} ellipsizeMode="tail">{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={() => {}}
            style={styles.bookmarkButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="bookmark-outline" size={16} color={colors.darkAmethyst[300]} />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatRelativeTime(job.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    padding: 16,
    marginBottom: 12,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    resizeMode: 'contain',
    padding: 2,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.darkAmethyst[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkAmethyst[600],
  },
  info: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkAmethyst[950],
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  companyName: {
    fontSize: 14,
    color: colors.darkAmethyst[500],
    fontWeight: '500',
  },
  separator: {
    color: colors.darkAmethyst[300],
    fontSize: 12,
  },
  location: {
    fontSize: 14,
    color: colors.darkAmethyst[400],
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.darkAmethyst[50],
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
  },
  tagText: {
    fontSize: 11,
    color: colors.darkAmethyst[600],
    fontWeight: '500',
  },
  responsibilities: {
    marginTop: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.darkAmethyst[400],
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 13,
    color: colors.darkAmethyst[700],
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  bookmarkButton: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 11,
    color: colors.darkAmethyst[400],
  },
});

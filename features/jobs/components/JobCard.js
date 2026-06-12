import { TouchableOpacity, View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import { fontSize, fontWeight } from '../../../src/theme';
import { FONT_FAMILY, FONT_FAMILY_MEDIUM, FONT_FAMILY_BOLD } from '../../../src/fonts';

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
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation();
  const company = job.companies;

  const s = {
    card: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 16, marginBottom: 12 },
    innerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    leftSection: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, minWidth: 0 },
    logo: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, borderColor: c.border, resizeMode: 'contain', padding: 2 },
    logoPlaceholder: { width: 48, height: 48, borderRadius: 12, backgroundColor: c['surface-muted'], alignItems: 'center', justifyContent: 'center' },
    logoText: { fontFamily: FONT_FAMILY_BOLD, fontSize: 18, fontWeight: '700', color: c.primary },
    info: { flex: 1, marginStart: 16, minWidth: 0 },
    title: { fontFamily: FONT_FAMILY_BOLD, fontSize: 16, fontWeight: '700', color: c.foreground },
    companyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
    companyName: { fontFamily: FONT_FAMILY_MEDIUM, fontSize: fontSize.sm, color: c.accent, fontWeight: fontWeight.medium },
    separator: { fontFamily: FONT_FAMILY, color: c['muted-foreground'], fontSize: 12 },
    location: { fontFamily: FONT_FAMILY, fontSize: fontSize.sm, color: c['muted-foreground'] },
    tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
    tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: c['surface-muted'], borderWidth: 1, borderColor: c.border },
    tagText: { fontFamily: FONT_FAMILY_MEDIUM, fontSize: 11, color: c.primary, fontWeight: '500' },
    responsibilities: { marginTop: 10 },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: c['muted-foreground'], marginTop: 6, marginRight: 8 },
    bulletText: { fontFamily: FONT_FAMILY, fontSize: 13, color: c.foreground, flex: 1 },
    rightSection: { alignItems: 'flex-end', marginLeft: 12 },
    bookmarkButton: { marginBottom: 8 },
    dateText: { fontFamily: FONT_FAMILY, fontSize: 11, color: c['muted-foreground'] },
  };

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate('JobDetails', { id: job.id })}
      activeOpacity={0.8}
    >
      <View style={s.innerRow}>
        <View style={s.leftSection}>
          {company?.logo_url ? (
            <Image source={{ uri: company.logo_url }} style={s.logo} />
          ) : (
            <View style={s.logoPlaceholder}>
              <Text style={s.logoText}>
                {company?.name?.[0] || '?'}
              </Text>
            </View>
          )}

          <View style={s.info}>
            <Text style={s.title} numberOfLines={1}>
              {job.title}
            </Text>

            <View style={s.companyRow}>
              {company?.name && (
                <Text style={s.companyName}>{company.name}</Text>
              )}
              {company?.location && (
                <>
                  <Text style={s.separator}>  •  </Text>
                  <Text style={s.location}>{company.location}</Text>
                </>
              )}
            </View>

            <View style={s.tags}>
              {job.job_type && (
                <View style={s.tag}>
                  <Text style={s.tagText}>{formatJobType(job.job_type)}</Text>
                </View>
              )}
              {job.seniority_level && (
                <View style={s.tag}>
                  <Text style={s.tagText}>
                    {job.seniority_level.charAt(0).toUpperCase() + job.seniority_level.slice(1)}
                  </Text>
                </View>
              )}
              {job.work_location && (
                <View style={s.tag}>
                  <Text style={s.tagText}>
                    {job.work_location.replace(/_/g, '-')}
                  </Text>
                </View>
              )}
              {job.salary_min != null && job.salary_max != null && (
                <View style={s.tag}>
                  <Text style={s.tagText}>
                    {Number(job.salary_min).toLocaleString()} – {Number(job.salary_max).toLocaleString()} EGP
                  </Text>
                </View>
              )}
            </View>

            {job.responsibilities?.length > 0 && (
              <View style={s.responsibilities}>
                {job.responsibilities.slice(0, 2).map((item, i) => (
                  <View key={i} style={s.bulletRow}>
                    <View style={s.bullet} />
                    <Text style={s.bulletText} numberOfLines={1} ellipsizeMode="tail">{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={s.rightSection}>
          <TouchableOpacity
            onPress={() => {}}
            style={s.bookmarkButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="bookmark-outline" size={16} color={c['muted-foreground']} />
          </TouchableOpacity>
          <Text style={s.dateText}>{formatRelativeTime(job.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// features/applicant/components/profile/AboutTab.js
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme';

function SectionCard({ title, icon, onEdit, viewOnly, children, empty, emptyText }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name={icon} size={16} color={colors.accent} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {!viewOnly && onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="pencil-outline" size={15} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
      {empty ? (
        <TouchableOpacity onPress={!viewOnly ? onEdit : null} disabled={viewOnly} activeOpacity={0.75}>
          <Text style={styles.emptyText}>
            {viewOnly ? 'Not added yet' : emptyText || 'Tap to add...'}
          </Text>
        </TouchableOpacity>
      ) : children}
    </View>
  );
}

export default function AboutTab({ profile, viewOnly, onEdit }) {
  const handleLink = (url) => {
    if (!url) return;
    const full = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(full).catch(() => {});
  };

  return (
    <View style={styles.container}>

      {/* Bio */}
      <SectionCard
        title="Bio"
        icon="person-outline"
        onEdit={() => onEdit('bio')}
        viewOnly={viewOnly}
        empty={!profile?.bio && !profile?.headline}
        emptyText="Add a headline and summary about yourself..."
      >
        {profile?.headline && <Text style={styles.headline}>{profile.headline}</Text>}
        {profile?.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
      </SectionCard>

      {/* Contact Info */}
      <SectionCard
        title="Contact Info"
        icon="call-outline"
        onEdit={() => onEdit('contact')}
        viewOnly={viewOnly}
        empty={!profile?.phone && !profile?.location}
        emptyText="Add your phone and location..."
      >
        <View style={styles.list}>
          {profile?.phone && (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="call-outline" size={14} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.listLabel}>Phone</Text>
                <Text style={styles.listValue}>{profile.phone}</Text>
              </View>
            </View>
          )}
          {profile?.location && (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#fce7f3' }]}>
                <Ionicons name="location-outline" size={14} color="#db2777" />
              </View>
              <View>
                <Text style={styles.listLabel}>Location</Text>
                <Text style={styles.listValue}>{profile.location}</Text>
              </View>
            </View>
          )}
        </View>
      </SectionCard>

      {/* Links — LinkedIn only */}
      <SectionCard
        title="Links"
        icon="link-outline"
        onEdit={() => onEdit('links')}
        viewOnly={viewOnly}
        empty={!profile?.linkedin_url}
        emptyText="Add your LinkedIn profile link..."
      >
        <View style={styles.list}>
          {profile?.linkedin_url && (
            <TouchableOpacity style={styles.listItem} onPress={() => handleLink(profile.linkedin_url)} activeOpacity={0.75}>
              <View style={[styles.listIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="logo-linkedin" size={14} color="#0a66c2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listLabel}>LinkedIn</Text>
                <Text style={[styles.listValue, styles.link]} numberOfLines={1}>{profile.linkedin_url}</Text>
              </View>
              <Ionicons name="open-outline" size={14} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>
      </SectionCard>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  card: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  editBtn: { padding: 4 },
  emptyText: { fontSize: 13, color: colors.mutedForeground, fontStyle: 'italic', lineHeight: 20 },
  headline: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 4 },
  bioText: { fontSize: 14, color: colors.foreground, lineHeight: 22 },
  list: { gap: 12 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  listLabel: { fontSize: 11, color: colors.mutedForeground, fontWeight: '500' },
  listValue: { fontSize: 13, color: colors.foreground, fontWeight: '500', marginTop: 1 },
  link: { color: colors.accent },
});
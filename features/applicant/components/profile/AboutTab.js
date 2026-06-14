import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';


function SectionCard({ title, icon, onEdit, viewOnly, children, empty, emptyText, styles }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name={icon} size={16} color={c.accent} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {!viewOnly && onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="pencil-outline" size={15} color={c['muted-foreground']} />
          </TouchableOpacity>
        )}
      </View>
      {empty ? (
        <TouchableOpacity onPress={!viewOnly ? onEdit : null} disabled={viewOnly} activeOpacity={0.75}>
          <Text style={styles.emptyText}>
            {viewOnly ? t('profile.not_added_yet') : emptyText || t('profile.tap_to_add')}
          </Text>
        </TouchableOpacity>
      ) : children}
    </View>
  );
}

export default function AboutTab({ profile, viewOnly, onEdit }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const handleLink = (url) => {
    if (!url) return;
    const full = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(full).catch(() => {});
  };

  return (
    <View style={styles.container}>

      {/* Bio */}
      <SectionCard styles={styles}
        title={t('profile.bio')}
        icon="person-outline"
        onEdit={() => onEdit('bio')}
        viewOnly={viewOnly}
        empty={!profile?.bio && !profile?.headline}
        emptyText={t('profile.add_bio')}
      >
        {profile?.headline && <Text style={styles.headline}>{profile.headline}</Text>}
        {profile?.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
      </SectionCard>

      {/* Contact Info */}
      <SectionCard styles={styles}
        title={t('profile.contact_info')}
        icon="call-outline"
        onEdit={() => onEdit('contact')}
        viewOnly={viewOnly}
        empty={!profile?.phone && !profile?.location}
        emptyText={t('profile.add_contact')}
      >
        <View style={styles.list}>
          {profile?.phone && (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: `${c.accent}18` }]}>
                <Ionicons name="call-outline" size={14} color={c.accent} />
              </View>
              <View>
                <Text style={styles.listLabel}>{t('profile.phone')}</Text>
                <Text style={styles.listValue}>{profile.phone}</Text>
              </View>
            </View>
          )}
          {profile?.location && (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: `${c.primary}18` }]}>
                <Ionicons name="location-outline" size={14} color={c.primary} />
              </View>
              <View>
                <Text style={styles.listLabel}>{t('profile.location')}</Text>
                <Text style={styles.listValue}>{profile.location}</Text>
              </View>
            </View>
          )}
        </View>
      </SectionCard>

      {/* Links — LinkedIn only */}
      <SectionCard styles={styles}
        title={t('profile.links')}
        icon="link-outline"
        onEdit={() => onEdit('links')}
        viewOnly={viewOnly}
        empty={!profile?.linkedin_url}
        emptyText={t('profile.add_links')}
      >
        <View style={styles.list}>
          {profile?.linkedin_url && (
            <TouchableOpacity style={styles.listItem} onPress={() => handleLink(profile.linkedin_url)} activeOpacity={0.75}>
              <View style={[styles.listIcon, { backgroundColor: `${c.accent}18` }]}>
                <Ionicons name="logo-linkedin" size={14} color={c.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listLabel}>{t('profile.linkedin')}</Text>
                <Text style={[styles.listValue, styles.link]} numberOfLines={1}>{profile.linkedin_url}</Text>
              </View>
              <Ionicons name="open-outline" size={14} color={c.accent} />
            </TouchableOpacity>
          )}
        </View>
      </SectionCard>

    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
  container: { gap: 14 },
  card: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 18, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, color: c.foreground, fontWeight: '700' },
  editBtn: { padding: 4 },
  emptyText: { fontSize: 13, color: c['muted-foreground'], fontStyle: 'italic', lineHeight: 20 },
  headline: { fontSize: 14, color: c.foreground, marginBottom: 4, fontWeight: '600' },
  bioText: { fontSize: 14, color: c.foreground, lineHeight: 22 },
  list: { gap: 12 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  listLabel: { fontSize: 11, color: c['muted-foreground'], fontWeight: '500' },
  listValue: { fontSize: 13, color: c.foreground, marginTop: 1, fontWeight: '500' },
  link: { color: c.accent },
  });
}
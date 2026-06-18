import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import ReportButton from '../../../admin/components/ReportButton';


export default function ProfileHero({ profile, viewOnly, onEditAvatar, onViewApplications }) {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const initials = (profile?.full_name || 'U')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <LinearGradient
      colors={theme.isDark ? [c.card, c.background] : [c.primary, c['muted-foreground']]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.card}
    >
      {/* Decorative background bubbles */}
      <View style={styles.bubble1} />
      <View style={styles.bubble2} />

      {/* Top row: avatar + My Applications button */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={viewOnly ? null : onEditAvatar}
          disabled={viewOnly}
          activeOpacity={viewOnly ? 1 : 0.8}
        >
          <View style={styles.avatarWrapper}>
            {profile?.profile_pic ? (
              <Image source={{ uri: profile.profile_pic }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            {!viewOnly && (
              <View style={styles.avatarEdit}>
                <Ionicons name="camera" size={12} color={c.white} />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {onViewApplications && (
          <TouchableOpacity style={styles.appsBtn} onPress={onViewApplications} activeOpacity={0.85}>
            <Ionicons name="layers-outline" size={14} color={c.white} />
            <Text style={styles.appsBtnText}>{t('profile.my_applications')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Name + headline */}
      <View style={styles.nameSection}>
        <Text style={styles.name}>{profile?.full_name || 'Unknown'}</Text>
        {profile?.headline ? (
          <Text style={styles.headline}>{profile.headline}</Text>
        ) : !viewOnly ? (
          <Text style={styles.headlinePlaceholder}>{t('profile.add_headline')}</Text>
        ) : null}
      </View>

      {/* Location + join date */}
      <View style={styles.metaRow}>
        {profile?.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.metaText}>{profile.location}</Text>
          </View>
        )}
        {joinDate && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.metaText}>{t('profile.joined')} {joinDate}</Text>
          </View>
        )}
      </View>

      {!viewOnly && (
        <View style={{ alignItems: "flex-end", marginTop: 4 }}>
          <ReportButton
            reportType="user"
            targetId={profile?.id}
            targetDetails={{ full_name: profile?.full_name }}
            variant="icon"
          />
        </View>
      )}

      {/* Links � LinkedIn only */}
      {/* {profile?.linkedin_url && (
        <View style={styles.linksRow}>
          <View style={styles.linkBadge}>
            <Ionicons name="logo-linkedin" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.linkText}>LinkedIn</Text>
          </View>
        </View>
      )} */}
    </LinearGradient>
  );
}

function createStyles(c) {
  return StyleSheet.create({
  card: { borderRadius: 20, padding: 20, gap: 14, overflow: 'hidden' },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarFallback: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: `${c.primary}40`,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 28, color: c.white, fontWeight: '700' },
  avatarEdit: {
    position: 'absolute', bottom: 2, right: 2,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: c.accent,
    borderWidth: 2, borderColor: c.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  appsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  appsBtnText: { fontSize: 12, color: c.white, fontWeight: '600' },
  nameSection: { gap: 4 },
  name: { fontSize: 24, color: c.white, letterSpacing: -0.3, fontWeight: '800' },
  headline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  headlinePlaceholder: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  bubble1: {
    position: 'absolute', top: -50, right: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: `${c.white}14`,
  },
  bubble2: {
    position: 'absolute', bottom: -60, left: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: `${c.white}0D`,
  },
  linksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linkBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  linkText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  });
}
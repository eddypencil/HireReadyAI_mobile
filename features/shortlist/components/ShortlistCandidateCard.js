import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import {
  FONT_FAMILY,
  FONT_FAMILY_MEDIUM,
  FONT_FAMILY_SEMIBOLD,
  FONT_FAMILY_BOLD,
} from '../../../src/fonts';
import { useTranslation } from '../../../shared/context/I18nContext';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const avatarColors = [
    '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b',
    '#f43f5e', '#6366f1', '#14b8a6', '#d946ef',
  ];
  let hash = 0;
  if (name) {
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function timeAgo(dateString, t) {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (weeks > 0) return t('shortlist.weeks_ago', { count: weeks });
  if (days > 0) return t('shortlist.days_ago', { count: days });
  if (hours > 0) return t('shortlist.hours_ago', { count: hours });
  return t('shortlist.just_now');
}

export default function ShortlistCandidateCard({ entry, index, isSelected, onClick }) {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  const c = theme.colors;
  const styles = createStyles(c);

  const TAG_STYLES = {
    'Strong Fit': { bg: `${c.success}1a`, text: c.success, border: `${c.success}40` },
    'Leaning hire': { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
    'Needs Review': { bg: `${c.warning}1a`, text: c.warning, border: `${c.warning}40` },
  };

  const { applications: app, tags = [], rank } = entry;
  const { profiles: candidate, shortlist_votes: votes = [], composite_score, ai_rationale, applied_at, is_rejected } = app;

  const upVotes = (votes || []).filter((v) => v.vote === 'up').length;
  const downVotes = (votes || []).filter((v) => v.vote === 'down').length;

  const voterAvatars = (votes || []).slice(0, 4);
  const remainingVoters = Math.max(0, (votes || []).length - 4);

  const scoreBg = composite_score >= 80 ? `${c.success}1a` : composite_score >= 65 ? `${c.warning}1a` : c.border;
  const scoreText = composite_score >= 80 ? c.success : composite_score >= 65 ? c.warning : c['muted-foreground'];

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.7}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        is_rejected && styles.rejectedCard,
      ]}
    >
      <View style={[styles.topRow, isRtl && styles.rowReverse]}>
        <Text style={styles.rank}>#{rank}</Text>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(candidate?.full_name) }]}>
          <Text style={styles.avatarText}>{getInitials(candidate?.full_name)}</Text>
        </View>
        <View style={styles.nameSection}>
          <View style={[styles.nameRow, isRtl && styles.rowReverse]}>
            <Text style={[styles.name, isSelected && styles.selectedName, isRtl && styles.textRight]} numberOfLines={1}>
              {candidate?.full_name || t("shortlist.unknown")}
            </Text>
            {is_rejected && (
              <View style={styles.rejectedBadge}>
                <Text style={styles.rejectedBadgeText}>{t("shortlist.rejected")}</Text>
              </View>
            )}
            {tags.slice(0, 2).map((tag) => {
              const tagStyle = TAG_STYLES[tag] || { bg: c.border, text: c['muted-foreground'], border: c.border };
              return (
                <View key={tag} style={[styles.tag, { backgroundColor: tagStyle.bg, borderColor: tagStyle.border }]}>
                  <Text style={[styles.tagText, { color: tagStyle.text }]}>{tag}</Text>
                </View>
              );
            })}
          </View>
          <View style={[styles.appliedRow, isRtl && styles.rowReverse]}>
            <Ionicons name="calendar-outline" size={11} color={c['muted-foreground']} />
            <Text style={styles.appliedText}>{t("shortlist.applied", { time: timeAgo(applied_at, t) })}</Text>
          </View>
        </View>
      </View>

      {ai_rationale ? (
        <View style={[styles.aiRow, isRtl ? { paddingLeft: 0, paddingRight: 30 } : {}]}>
          <Ionicons name="sparkles" size={14} color={c['muted-foreground']} style={styles.aiIcon} />
          <Text style={[styles.aiText, isRtl && styles.textRight]} numberOfLines={2}>{ai_rationale}</Text>
        </View>
      ) : null}

      <View style={[styles.footer, isRtl && styles.rowReverse]}>
        <View style={styles.voterRow}>
          {voterAvatars.map((v, i) => (
            <View
              key={v.id || i}
              style={[
                styles.voterAvatar,
                { backgroundColor: getAvatarColor(v.profiles?.full_name) },
                isRtl ? { marginRight: i === 0 ? 0 : -6 } : { marginLeft: i === 0 ? 0 : -6 },
              ]}
            >
              <Text style={styles.voterAvatarText}>{getInitials(v.profiles?.full_name)}</Text>
            </View>
          ))}
          {remainingVoters > 0 && (
            <View style={[styles.voterAvatar, styles.voterOverflow, isRtl ? { marginRight: -6 } : { marginLeft: -6 }]}> 
              <Text style={styles.voterOverflowText}>+{remainingVoters}</Text>
            </View>
          )}
        </View>

        <View style={styles.scoreRow}>
          <Text style={[styles.aiMatchLabel, isRtl && styles.textRight]}>
            {t("shortlist.ai_match")} {' '}
            <Text style={[styles.scoreBadge, { backgroundColor: scoreBg, color: scoreText }]}> 
              {composite_score || '—'}
            </Text>
          </Text>
          <View style={[styles.voteCountRow, isRtl && styles.rowReverse]}>
            <Ionicons name="thumbs-up" size={12} color={c.success} />
            <Text style={[styles.voteCount, { color: c.success }]}>{upVotes}</Text>
            <Text style={styles.voteDivider}>—</Text>
            <Ionicons name="thumbs-down" size={12} color={c.destructive} />
            <Text style={[styles.voteCount, { color: c.destructive }]}>{downVotes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(c) { return StyleSheet.create({
  card: {
    backgroundColor: c.card,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: c['surface-muted'],
    borderLeftColor: c['muted-foreground'],
  },
  rejectedCard: {
    opacity: 0.5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  rank: {
    fontSize: 10,
    fontFamily: FONT_FAMILY_BOLD,
    color: c['muted-foreground'],
    marginTop: 2,
    width: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY_BOLD,
    color: c['destructive-foreground'],
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 14,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    color: c.foreground,
  },
  selectedName: {
    color: c.foreground,
  },
  rejectedBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: `${c.destructive}1a`,
    borderWidth: 1,
    borderColor: `${c.destructive}40`,
    borderRadius: 4,
  },
  rejectedBadgeText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: c.destructive,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY_MEDIUM,
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  appliedText: {
    fontSize: 11,
    color: c['muted-foreground'],
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 10,
    paddingLeft: 30,
  },
  aiIcon: {
    marginTop: 2,
  },
  aiText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY,
    color: c['muted-foreground'],
    lineHeight: 17,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 30,
  },
  voterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voterAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voterAvatarText: {
    fontSize: 9,
    fontFamily: FONT_FAMILY_BOLD,
    color: c['destructive-foreground'],
  },
  voterOverflow: {
    backgroundColor: c.border,
    borderColor: c.card,
  },
  voterOverflowText: {
    fontSize: 9,
    fontFamily: FONT_FAMILY_BOLD,
    color: c['muted-foreground'],
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiMatchLabel: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: c['muted-foreground'],
  },
  scoreBadge: {
    fontFamily: FONT_FAMILY_BOLD,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    fontSize: 12,
    overflow: 'hidden',
  },
  voteCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  voteCount: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_MEDIUM,
  },
  voteDivider: {
    color: c.border,
    marginHorizontal: 2,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
}); }

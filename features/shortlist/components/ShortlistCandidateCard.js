import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme';

const TAG_STYLES = {
  'Strong Fit': { bg: colors.emerald[50], text: colors.emerald[700], border: colors.emerald[200] },
  'Leaning hire': { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
  'Needs Review': { bg: colors.amber[50], text: colors.amber[700], border: colors.amber[200] },
};

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

function timeAgo(dateString) {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

export default function ShortlistCandidateCard({ entry, index, isSelected, onClick }) {
  const { applications: app, tags = [], rank } = entry;
  const { profiles: candidate, shortlist_votes: votes = [], composite_score, ai_rationale, applied_at, is_rejected } = app;

  const upVotes = (votes || []).filter((v) => v.vote === 'up').length;
  const downVotes = (votes || []).filter((v) => v.vote === 'down').length;

  const voterAvatars = (votes || []).slice(0, 4);
  const remainingVoters = Math.max(0, (votes || []).length - 4);

  const scoreBg = composite_score >= 80 ? colors.emerald[50] : composite_score >= 65 ? colors.amber[50] : colors.gray[100];
  const scoreText = composite_score >= 80 ? colors.emerald[700] : composite_score >= 65 ? colors.amber[700] : colors.gray[600];

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
      <View style={styles.topRow}>
        <Text style={styles.rank}>#{rank}</Text>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(candidate?.full_name) }]}>
          <Text style={styles.avatarText}>{getInitials(candidate?.full_name)}</Text>
        </View>
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, isSelected && styles.selectedName]} numberOfLines={1}>
              {candidate?.full_name || 'Unknown'}
            </Text>
            {is_rejected && (
              <View style={styles.rejectedBadge}>
                <Text style={styles.rejectedBadgeText}>Rejected</Text>
              </View>
            )}
            {tags.slice(0, 2).map((tag) => {
              const tagStyle = TAG_STYLES[tag] || { bg: colors.gray[100], text: colors.gray[600], border: colors.gray[200] };
              return (
                <View key={tag} style={[styles.tag, { backgroundColor: tagStyle.bg, borderColor: tagStyle.border }]}>
                  <Text style={[styles.tagText, { color: tagStyle.text }]}>{tag}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.appliedRow}>
            <Ionicons name="calendar-outline" size={11} color={colors.gray[400]} />
            <Text style={styles.appliedText}>Applied {timeAgo(applied_at)}</Text>
          </View>
        </View>
      </View>

      {ai_rationale ? (
        <View style={styles.aiRow}>
          <Ionicons name="sparkles" size={14} color={colors.mauveMagic[400]} style={styles.aiIcon} />
          <Text style={styles.aiText} numberOfLines={2}>{ai_rationale}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.voterRow}>
          {voterAvatars.map((v, i) => (
            <View
              key={v.id || i}
              style={[
                styles.voterAvatar,
                { backgroundColor: getAvatarColor(v.profiles?.full_name), marginLeft: i === 0 ? 0 : -6 },
              ]}
            >
              <Text style={styles.voterAvatarText}>{getInitials(v.profiles?.full_name)}</Text>
            </View>
          ))}
          {remainingVoters > 0 && (
            <View style={[styles.voterAvatar, styles.voterOverflow, { marginLeft: -6 }]}>
              <Text style={styles.voterOverflowText}>+{remainingVoters}</Text>
            </View>
          )}
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.aiMatchLabel}>
            AI match{' '}
            <Text style={[styles.scoreBadge, { backgroundColor: scoreBg, color: scoreText }]}>
              {composite_score || '—'}
            </Text>
          </Text>
          <View style={styles.voteCountRow}>
            <Ionicons name="thumbs-up" size={12} color={colors.emerald[600]} />
            <Text style={[styles.voteCount, { color: colors.emerald[600] }]}>{upVotes}</Text>
            <Text style={styles.voteDivider}>—</Text>
            <Ionicons name="thumbs-down" size={12} color={colors.red[400]} />
            <Text style={[styles.voteCount, { color: colors.red[400] }]}>{downVotes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: colors.darkAmethyst[50],
    borderLeftColor: colors.darkAmethyst[500],
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
    fontWeight: '700',
    color: colors.gray[400],
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
    fontWeight: '700',
    color: colors.white,
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
    fontWeight: '600',
    color: colors.gray[900],
  },
  selectedName: {
    color: colors.darkAmethyst[900],
  },
  rejectedBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
    borderRadius: 4,
  },
  rejectedBadgeText: {
    fontSize: 10,
    color: colors.red[500],
    fontWeight: '500',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  appliedText: {
    fontSize: 11,
    color: colors.gray[400],
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
    color: colors.gray[500],
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
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voterAvatarText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  voterOverflow: {
    backgroundColor: colors.gray[200],
    borderColor: colors.white,
  },
  voterOverflowText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.gray[600],
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiMatchLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[500],
  },
  scoreBadge: {
    fontWeight: '700',
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
    fontWeight: '500',
  },
  voteDivider: {
    color: colors.gray[300],
    marginHorizontal: 2,
  },
});

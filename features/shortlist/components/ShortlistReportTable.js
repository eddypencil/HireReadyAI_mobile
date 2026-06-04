import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme';

function getInitials(name) {
  if (!name) return 'NA';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

function calculateVotes(votes) {
  let up = 0, neutral = 0, down = 0;
  (votes || []).forEach((v) => {
    if (v.vote === 'up') up++;
    else if (v.vote === 'neutral') neutral++;
    else if (v.vote === 'down') down++;
  });
  return { up, neutral, down };
}

function ProgressBar({ score, color }) {
  const barColor = color || colors.darkAmethyst[600];
  return (
    <View style={styles.progressBarRow}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(score || 0, 100)}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.progressScore}>{score || 0}</Text>
    </View>
  );
}

function CompositeCircle({ score }) {
  const circleColor = score >= 90 ? colors.emerald[500] : score >= 80 ? colors.emerald[400] : colors.amber[400];
  return (
    <View style={[styles.compositeCircle, { borderColor: circleColor }]}>
      <Text style={[styles.compositeScore, { color: circleColor }]}>{score || 0}</Text>
    </View>
  );
}

export default function ShortlistReportTable({ entries, selectedIds, onToggleSelect }) {
  if (!entries || entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No candidates in shortlist.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {entries.map((entry) => {
        const app = entry.applications;
        const profile = app.profiles;
        const isSelected = (selectedIds || []).includes(app.id);
        const votes = calculateVotes(app.shortlist_votes);

        return (
          <TouchableOpacity
            key={entry.id}
            onPress={() => onToggleSelect(app.id)}
            activeOpacity={0.7}
            style={[styles.card, isSelected && styles.selectedCard]}
          >
            <View style={styles.cardLeft}>
              <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{entry.rank}</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.candidateRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(profile?.full_name)}</Text>
                </View>
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName} numberOfLines={1}>{profile?.full_name}</Text>
                  <Text style={styles.candidateHeadline} numberOfLines={1}>{profile?.headline}</Text>
                </View>
              </View>

              <View style={styles.scoresRow}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>CV</Text>
                  <ProgressBar score={app.cv_score} color={colors.darkAmethyst[600]} />
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Tests</Text>
                  <ProgressBar score={app.test_score} color={colors.darkAmethyst[600]} />
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Interview</Text>
                  <ProgressBar score={app.interview_score} color={colors.darkAmethyst[600]} />
                </View>
              </View>

              <View style={styles.bottomRow}>
                <CompositeCircle score={app.composite_score} />
                <View style={styles.teamVoteRow}>
                  <TouchableOpacity style={styles.voteButtonUp}>
                    <Ionicons name="thumbs-up" size={13} color={colors.emerald[600]} />
                    <Text style={styles.voteButtonText}>{votes.up}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.voteButtonNeutral}>
                    <Ionicons name="remove" size={13} color={colors.gray[500]} />
                    <Text style={styles.voteButtonText}>{votes.neutral}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.voteButtonDown}>
                    <Ionicons name="thumbs-down" size={13} color={colors.red[500]} />
                    <Text style={styles.voteButtonText}>{votes.down}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 24,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedCard: {
    borderColor: colors.darkAmethyst[300],
    backgroundColor: colors.darkAmethyst[50],
  },
  cardLeft: {
    backgroundColor: colors.darkAmethyst[950],
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 10,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray[600],
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  candidateHeadline: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 1,
  },
  scoresRow: {
    gap: 6,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.gray[500],
    width: 56,
  },
  progressBarRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressScore: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
    width: 24,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  compositeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compositeScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  teamVoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteButtonUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.emerald[50],
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  voteButtonNeutral: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  voteButtonDown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.red[50],
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  voteButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray[700],
  },
});

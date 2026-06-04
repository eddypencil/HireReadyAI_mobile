import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme';

export default function ShortlistInsightsBar({ insightsSummary, selectedJobTitle }) {
  const { up, neutral, down, awaitingVote, total } = insightsSummary;
  const topAdvanceCount = Math.max(1, Math.round(total * 0.3));

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="thumbs-up" size={14} color={colors.emerald[600]} />
          <Text style={[styles.statText, { color: colors.emerald[600] }]}>
            Up votes <Text style={styles.bold}>{up}</Text>
          </Text>
        </View>
        <Text style={styles.separator}>—</Text>
        <View style={styles.statItem}>
          <Ionicons name="remove" size={14} color={colors.gray[500]} />
          <Text style={[styles.statText, { color: colors.gray[500] }]}>
            Neutral <Text style={styles.bold}>{neutral}</Text>
          </Text>
        </View>
        <Text style={styles.separator}>—</Text>
        <View style={styles.statItem}>
          <Ionicons name="thumbs-down" size={14} color={colors.red[400]} />
          <Text style={[styles.statText, { color: colors.red[400] }]}>
            Down votes <Text style={styles.bold}>{down}</Text>
          </Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.totalText}>
          <Text style={styles.totalBold}>{total}</Text> shortlisted
          {awaitingVote > 0 && (
            <Text>
              {' · '}<Text style={styles.awaitingBold}>{awaitingVote}</Text> awaiting first vote
            </Text>
          )}
        </Text>
      </View>
      <View style={styles.badge}>
        <Ionicons name="sparkles" size={14} color={colors.mauveMagic[600]} />
        <Text style={styles.badgeText}>
          AI suggests advancing top {topAdvanceCount} to onsite
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bold: {
    fontWeight: '700',
  },
  separator: {
    color: colors.gray[300],
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.gray[200],
    marginHorizontal: 2,
  },
  totalText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  totalBold: {
    fontWeight: '600',
    color: colors.gray[800],
  },
  awaitingBold: {
    fontWeight: '600',
    color: colors.amber[600],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.mauveMagic[50],
    borderWidth: 1,
    borderColor: colors.mauveMagic[100],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.mauveMagic[600],
  },
});

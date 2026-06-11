import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';

export default function ShortlistInsightsBar({ insightsSummary, selectedJobTitle }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const { up, neutral, down, awaitingVote, total } = insightsSummary;
  const topAdvanceCount = Math.max(1, Math.round(total * 0.3));

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="thumbs-up" size={14} color={c.success} />
          <Text style={[styles.statText, { color: c.success }]}>
            {t("shortlist.up_votes")} <Text style={styles.bold}>{up}</Text>
          </Text>
        </View>
        <Text style={styles.separator}>—</Text>
        <View style={styles.statItem}>
          <Ionicons name="remove" size={14} color={c['muted-foreground']} />
          <Text style={[styles.statText, { color: c['muted-foreground'] }]}>
            {t("shortlist.neutral_votes")} <Text style={styles.bold}>{neutral}</Text>
          </Text>
        </View>
        <Text style={styles.separator}>—</Text>
        <View style={styles.statItem}>
          <Ionicons name="thumbs-down" size={14} color={c.destructive} />
          <Text style={[styles.statText, { color: c.destructive }]}>
            {t("shortlist.down_votes")} <Text style={styles.bold}>{down}</Text>
          </Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.totalText}>
          <Text style={styles.totalBold}>{total}</Text> {t("shortlist.shortlisted")}
          {awaitingVote > 0 && (
            <Text>
              {' · '}<Text style={styles.awaitingBold}>{awaitingVote}</Text> {t("shortlist.awaiting_votes")}
            </Text>
          )}
        </Text>
      </View>
    </View>
  );
}

function createStyles(c) { return StyleSheet.create({
  container: {
    backgroundColor: c.card,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
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
    color: c.border,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: c.border,
    marginHorizontal: 2,
  },
  totalText: {
    fontSize: 12,
    color: c['muted-foreground'],
  },
  totalBold: {
    fontWeight: '600',
    color: c.foreground,
  },
  awaitingBold: {
    fontWeight: '600',
    color: c.warning,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c['surface-muted'],
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: c.primary,
  },
}); }

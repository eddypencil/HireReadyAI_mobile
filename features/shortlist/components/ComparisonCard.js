import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';

function getInitials(name) {
  if (!name) return 'NA';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function ComparisonCard({ application }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);

  function DimensionRow({ name, score }) {
    return (
      <View style={styles.dimensionRow}>
        <Text style={styles.dimensionName} numberOfLines={1}>{name}</Text>
        <View style={styles.dimensionBarRow}>
          <View style={styles.dimensionTrack}>
            <View style={[styles.dimensionFill, { width: `${Math.min(score || 0, 100)}%` }]} />
          </View>
          <Text style={styles.dimensionScore}>{score || 0}</Text>
        </View>
      </View>
    );
  }

  const profile = application.profiles;
  const dimensions = application.cv_dimension_scores || [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(profile?.full_name)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>{profile?.full_name}</Text>
          <Text style={styles.composite}>{t("shortlist.composite")} {application.composite_score}</Text>
        </View>
      </View>

      <View style={styles.dimensions}>
        {dimensions.length === 0 && (
          <Text style={styles.emptyText}>{t("shortlist.no_dimension_scores")}</Text>
        )}
        {dimensions.map((dim, idx) => (
          <DimensionRow key={idx} name={dim.dimension_name} score={dim.score} />
        ))}
      </View>
    </View>
  );
}

function createStyles(c) { return StyleSheet.create({
  card: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    padding: 20,
    width: 280,
    minWidth: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: c['muted-foreground'],
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: c.foreground,
  },
  composite: {
    fontSize: 11,
    color: c['muted-foreground'],
    marginTop: 1,
  },
  dimensions: {
    gap: 12,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimensionName: {
    fontSize: 13,
    color: c['muted-foreground'],
    width: 100,
    marginRight: 8,
  },
  dimensionBarRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dimensionTrack: {
    flex: 1,
    height: 6,
    backgroundColor: c.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  dimensionFill: {
    height: 6,
    backgroundColor: c.primary,
    borderRadius: 3,
  },
  dimensionScore: {
    fontSize: 11,
    fontWeight: '600',
    color: c.foreground,
    width: 22,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 12,
    color: c['muted-foreground'],
    textAlign: 'center',
  },
}); }

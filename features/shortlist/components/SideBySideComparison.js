import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme';
import ComparisonCard from './ComparisonCard';

export default function SideBySideComparison({ selectedCandidates, onReorder }) {
  if (!selectedCandidates || selectedCandidates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Select candidates from the table above to compare them side-by-side.
        </Text>
      </View>
    );
  }

  const handleMoveLeft = (index) => {
    if (index === 0) return;
    const reordered = [...selectedCandidates];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    onReorder(reordered);
  };

  const handleMoveRight = (index) => {
    if (index === selectedCandidates.length - 1) return;
    const reordered = [...selectedCandidates];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    onReorder(reordered);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Side-by-side comparison</Text>
        <Text style={styles.subtitle}>
          Select 2-3 candidates to compare dimensions in detail. Use arrows to reorder.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedCandidates.map((candidate, index) => (
          <View key={candidate.id || candidate.applications?.id || index} style={styles.cardWrapper}>
            {selectedCandidates.length > 1 && (
              <View style={styles.reorderControls}>
                <TouchableOpacity
                  onPress={() => handleMoveLeft(index)}
                  disabled={index === 0}
                  style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                >
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={index === 0 ? colors.gray[300] : colors.darkAmethyst[600]}
                  />
                </TouchableOpacity>
                <Text style={styles.reorderIndex}>{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => handleMoveRight(index)}
                  disabled={index === selectedCandidates.length - 1}
                  style={[styles.reorderBtn, index === selectedCandidates.length - 1 && styles.reorderBtnDisabled]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={index === selectedCandidates.length - 1 ? colors.gray[300] : colors.darkAmethyst[600]}
                  />
                </TouchableOpacity>
              </View>
            )}
            <ComparisonCard application={candidate} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.gray[500],
    textAlign: 'center',
  },
  headerSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.gray[500],
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 20,
    paddingBottom: 8,
    minHeight: 200,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  reorderBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnDisabled: {
    opacity: 0.4,
  },
  reorderIndex: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[500],
    minWidth: 16,
    textAlign: 'center',
  },
});

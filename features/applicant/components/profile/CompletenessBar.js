// features/applicant/components/profile/CompletenessBar.js
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme';

function getLabel(score) {
  if (score >= 91) return { text: 'Your profile is complete and recruiter-ready! 🎉', color: '#16a34a' };
  if (score >= 71) return { text: 'Almost there! A few more fields will make you shine.', color: colors.accent };
  if (score >= 41) return { text: 'Good start! Add more details to stand out.', color: '#d97706' };
  return { text: 'Your profile needs work — recruiters may skip incomplete profiles.', color: '#dc2626' };
}

function getBarColor(score) {
  if (score >= 91) return '#22c55e';
  if (score >= 71) return colors.accent;
  if (score >= 41) return '#f59e0b';
  return '#ef4444';
}

export function calcCompleteness(profile) {
  const fields = [
    { key: 'profile_pic',  label: 'Profile photo',  weight: 10 },
    { key: 'headline',     label: 'Headline',        weight: 10 },
    { key: 'bio',          label: 'Bio / Summary',   weight: 15 },
    { key: 'location',     label: 'Location',        weight: 5  },
    { key: 'phone',        label: 'Phone number',    weight: 5  },
    { key: 'linkedin_url', label: 'LinkedIn URL',    weight: 5  },
    { key: 'experience',   label: 'Work experience', weight: 20 },
    { key: 'education',    label: 'Education',       weight: 15 },
    { key: 'skills',       label: 'Skills',          weight: 10 },
    { key: 'projects',     label: 'Projects',        weight: 5  },
  ];

  let score = 0;
  const missing = [];

  fields.forEach(f => {
    const val = profile?.[f.key];
    const filled = Array.isArray(val) ? val.length > 0 : !!val;
    if (filled) score += f.weight;
    else missing.push(f.label);
  });

  return { score, missing };
}

export default function CompletenessBar({ score, missing, onFieldPress }) {
  const { text, color } = getLabel(score);
  const barColor = getBarColor(score);

  return (
    <View style={styles.card}>
      {/* Score row */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreLeft}>
          <Text style={styles.scoreNum}>{score}%</Text>
          <Text style={styles.scoreLabel}>Profile Complete</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: `${barColor}18`, borderColor: `${barColor}40` }]}>
          <Text style={[styles.scoreBadgeText, { color: barColor }]}>
            {score >= 91 ? 'Complete' : score >= 71 ? 'Almost' : score >= 41 ? 'In Progress' : 'Incomplete'}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${score}%`, backgroundColor: barColor }]} />
      </View>

      {/* Message */}
      <Text style={[styles.message, { color }]}>{text}</Text>

      {/* Missing fields */}
      {missing.length > 0 && (
        <View style={styles.missingSection}>
          <Text style={styles.missingTitle}>Add these to boost your profile:</Text>
          <View style={styles.missingPills}>
            {missing.slice(0, 4).map((field, i) => (
              <TouchableOpacity
                key={i}
                style={styles.missingPill}
                onPress={() => onFieldPress?.(field)}
                activeOpacity={0.75}
              >
                <Ionicons name="add-circle-outline" size={12} color={colors.accent} />
                <Text style={styles.missingPillText}>{field}</Text>
              </TouchableOpacity>
            ))}
            {missing.length > 4 && (
              <View style={styles.morePill}>
                <Text style={styles.morePillText}>+{missing.length - 4} more</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border,
    padding: 18, gap: 12,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreLeft: { gap: 1 },
  scoreNum: { fontSize: 26, fontWeight: '800', color: colors.foreground },
  scoreLabel: { fontSize: 11, color: colors.mutedForeground, fontWeight: '500' },
  scoreBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  scoreBadgeText: { fontSize: 11, fontWeight: '700' },
  track: { height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  message: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  missingSection: { gap: 8 },
  missingTitle: { fontSize: 12, color: colors.mutedForeground, fontWeight: '600' },
  missingPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  missingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${colors.accent}12`,
    borderWidth: 1, borderColor: `${colors.accent}30`,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  missingPillText: { fontSize: 11, color: colors.accent, fontWeight: '600' },
  morePill: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  morePillText: { fontSize: 11, color: colors.mutedForeground },
});
// features/applicant/components/feedback/ScoreRing.js
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../../../src/theme';

export default function ScoreRing({ score, size = 92, strokeWidth = 8, percentileTag, onDark = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score || 0, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.wrapper}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Defs>
            <LinearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={onDark ? colors.emerald[200] : colors.primary} />
              <Stop offset="100%" stopColor={onDark ? colors.white : colors.secondary} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={onDark ? 'rgba(255,255,255,0.2)' : colors.line}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="url(#scoreGrad)" strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.scoreCenter]}>
          <Text style={[styles.scoreText, { color: onDark ? colors.white : colors.ink }]}>
            {score != null ? Math.round(score) : '--'}
          </Text>
          <Text style={[styles.outOf, { color: onDark ? 'rgba(255,255,255,0.7)' : colors.muted }]}>
            / 100
          </Text>
        </View>
      </View>
      {percentileTag && (
        <View style={[styles.percentileBadge, onDark && styles.percentileBadgeDark]}>
          <Text style={[styles.percentileText, onDark && { color: colors.white }]}>
            {percentileTag.label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 6 },
  scoreCenter: { alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  outOf: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 1 },
  percentileBadge: {
    borderWidth: 1, borderColor: colors.primary,
    backgroundColor: colors.accentSoftBg,
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3,
  },
  percentileBadgeDark: {
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  percentileText: { fontSize: 10, fontWeight: '700', color: colors.primary },
});

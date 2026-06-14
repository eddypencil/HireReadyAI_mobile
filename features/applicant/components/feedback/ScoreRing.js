// features/applicant/components/feedback/ScoreRing.js
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../../../shared/context/ThemeContext';


export default function ScoreRing({ score, size = 92, strokeWidth = 8, percentileTag, onDark = false }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
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
              <Stop offset="0%" stopColor={onDark ? c.emerald[200] : c.primary} />
              <Stop offset="100%" stopColor={onDark ? c.white : c.secondary} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={onDark ? `${c.white}33` : c.border}
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
          <Text style={[styles.scoreText, { color: onDark ? c.white : c.foreground }]}>
            {score != null ? Math.round(score) : '--'}
          </Text>
          <Text style={[styles.outOf, { color: onDark ? `${c.white}B3` : c['muted-foreground'] }]}>
            / 100
          </Text>
        </View>
      </View>
      {percentileTag && (
        <View style={[styles.percentileBadge, onDark && styles.percentileBadgeDark]}>
          <Text style={[styles.percentileText, onDark && { color: c.white }]}>
            {percentileTag.label}
          </Text>
        </View>
      )}
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 6 },
  scoreCenter: { alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: 24, letterSpacing: -0.5, fontWeight: '800' },
  outOf: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginTop: 1, fontWeight: '700' },
  percentileBadge: {
    borderWidth: 1, borderColor: c.primary,
    backgroundColor: c['surface-muted'],
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3,
  },
  percentileBadgeDark: {
    borderColor: `${c.white}59`,
    backgroundColor: `${c.white}26`,
  },
  percentileText: { fontSize: 10, color: c.primary, fontWeight: '700' },
});
}

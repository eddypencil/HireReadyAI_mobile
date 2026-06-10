import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../src/theme';

export default function Badge({ children, variant = 'default', style }) {
  const { theme } = useTheme();
  const c = theme.colors;

  const colorMap = {
    default: { bg: c.secondary, text: c.foreground },
    primary: { bg: c.primary, text: c['destructive-foreground'] },
    success: { bg: c.success, text: c['destructive-foreground'] },
    warning: { bg: c.warning, text: c['destructive-foreground'] },
    destructive: { bg: c.destructive, text: c['destructive-foreground'] },
    applied: { bg: c['stage-applied'], text: c.foreground },
    screening: { bg: c['stage-screening'], text: c['destructive-foreground'] },
    interview: { bg: c['stage-interview'], text: c['destructive-foreground'] },
    assessment: { bg: c['stage-assessment'], text: c['destructive-foreground'] },
    final: { bg: c['stage-final'], text: c['destructive-foreground'] },
    hired: { bg: c['stage-hired'], text: c['destructive-foreground'] },
  };

  const colors = colorMap[variant] || colorMap.default;

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
  },
});

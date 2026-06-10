import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../src/theme';

export default function LoadingSpinner({ message = 'Loading...' }) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: c['surface-muted'] }]}>
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.text, { color: c['muted-foreground'] }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[10],
    paddingVertical: spacing[8],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    maxWidth: 260,
    ...shadow.sm,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});

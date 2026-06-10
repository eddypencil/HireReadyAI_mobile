import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, shadow } from '../../src/theme';

export function Card({ children, style, variant = 'default', onPress }) {
  const { theme } = useTheme();
  const c = theme.colors;

  const variantCardStyle = variant === 'stat'
    ? { padding: spacing[5], ...shadow.xs }
    : variant === 'empty'
    ? { padding: spacing[8], alignItems: 'center' }
    : { padding: spacing[4], ...shadow.sm };

  const Container = onPress ? require('react-native').TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : undefined}
      style={[
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: c.border,
        },
        variantCardStyle,
        style,
      ]}
    >
      {children}
    </Container>
  );
}

export function CardContent({ children, style }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  content: {},
});

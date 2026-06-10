import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, fontSize } from '../../src/theme';

export default function Input({ style, ...props }) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <TextInput
      placeholderTextColor={`${c['muted-foreground']}${70}`}
      style={[
        styles.input,
        {
          color: c.foreground,
          backgroundColor: c.background,
          borderColor: c.input,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: '100%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing[2.5],
    fontSize: fontSize.sm,
  },
});

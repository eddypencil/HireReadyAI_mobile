import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../src/theme';

export default function FormField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onChangeText,
  required = false,
  hint,
  error,
  ...props
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';

  const handleChangeText = onChangeText || onChange;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: c['sidebar-foreground'] }]}>
          {label}{required ? ' *' : ''}
        </Text>
        {hint}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          secureTextEntry={isPassword && !showPassword}
          placeholder={placeholder}
          placeholderTextColor={`${c['muted-foreground']}99`}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            {
              color: c.foreground,
              backgroundColor: c.background,
              borderColor: error ? c.destructive : isFocused ? c.ring : c.input,
            },
            isFocused && { borderColor: c.ring },
            isPassword && styles.inputWithToggle,
            error ? { borderColor: c.destructive } : null,
          ]}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.toggleButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={c['muted-foreground']}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[styles.error, { color: c.destructive }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1.5],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 44,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    fontSize: fontSize.sm,
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  inputWithToggle: {
    paddingRight: 48,
  },
  toggleButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  error: {
    fontSize: fontSize.xs,
  },
});

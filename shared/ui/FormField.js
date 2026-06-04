import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';

  const handleChangeText = onChangeText || onChange;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}{required ? ' *' : ''}
        </Text>
        {hint}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          secureTextEntry={isPassword && !showPassword}
          placeholder={placeholder}
          placeholderTextColor={colors.darkAmethyst[300]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            isPassword && styles.inputWithToggle,
            error ? styles.inputError : null,
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
              color={colors.darkAmethyst[500]}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.darkAmethyst[500],
    letterSpacing: 0.5,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.darkAmethyst[900],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    outlineStyle: 'none',
  },
  inputFocused: {
    borderColor: '#8400ff',
    shadowColor: 'rgba(132, 0, 255, 0.08)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputWithToggle: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: colors.red[400],
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
    fontSize: 12,
    color: colors.red[500],
  },
});

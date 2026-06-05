import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FormField from '../../../shared/ui/FormField';
import { signUp } from '../services/auth.service';
import { colors } from '../../../src/theme';
import { USER_ROLE } from '../../../shared/constants/enums';

const ROLES = [
  { label: 'Applicant', value: USER_ROLE.applicant },
  { label: 'Recruiter', value: USER_ROLE.recruiter },
];

export default function RegisterPage() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(USER_ROLE.applicant);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  async function handleSignUp() {
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim(), role);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.branding}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>H</Text>
          </View>
          <Text style={styles.appName}>
            HireReady<Text style={styles.aiHighlight}>AI</Text>
          </Text>
        </View>

        <Text style={styles.headline}>Create account</Text>
        <Text style={styles.subheading}>Fill in your details to get started</Text>

        <View style={styles.roleToggle}>
          {ROLES.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.roleOption,
                role === value && styles.roleOptionActive,
              ]}
              onPress={() => setRole(value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.roleText,
                  role === value && styles.roleTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <FormField
            label="Full name"
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChangeText={setFullName}
            required
          />

          <FormField
            label="Email"
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChangeText={setEmail}
            required
          />

          <FormField
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            required
          />

          <FormField
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            required
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkHighlight}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.darkAmethyst[950],
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.darkAmethyst[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  aiHighlight: {
    color: colors.darkAmethyst[300],
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: colors.darkAmethyst[300],
    marginBottom: 24,
  },
  roleToggle: {
    flexDirection: 'row',
    gap: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionActive: {
    backgroundColor: colors.darkAmethyst[600],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkAmethyst[400],
  },
  roleTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
    color: colors.red[600],
  },
  button: {
    height: 48,
    backgroundColor: colors.darkAmethyst[600],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(132, 0, 255, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 13,
    color: colors.darkAmethyst[400],
  },
  linkHighlight: {
    color: colors.darkAmethyst[200],
    fontWeight: '600',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../src/theme';

export default function ForgotPasswordPage() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSendReset() {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const { supabase } = require('../../../shared/services/supabase');
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: 'hirereadyai://reset-password' }
      );
      if (resetError) throw resetError;
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View style={styles.branding}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>H</Text>
            </View>
            <Text style={styles.appName}>
              HireReady<Text style={styles.aiHighlight}>AI</Text>
            </Text>
          </View>

          <Text style={styles.headline}>Check your inbox</Text>
          <Text style={styles.subheading}>
            We sent a reset link to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.form}>
            <View style={styles.successCard}>
              <Text style={styles.successText}>
                Check your inbox and follow the instructions to reset your
                password.
              </Text>
              <Text style={styles.spamNote}>
                Didn't get it? Check your spam folder.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.branding}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>H</Text>
          </View>
          <Text style={styles.appName}>
            HireReady<Text style={styles.aiHighlight}>AI</Text>
          </Text>
        </View>

        <Text style={styles.headline}>Forgot password?</Text>
        <Text style={styles.subheading}>
          Enter your email and we'll send you a reset link
        </Text>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@gmail.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendReset}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#012a4a',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#01497c',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  aiHighlight: {
    color: '#468faf',
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#468faf',
    marginBottom: 32,
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#89c2d9',
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#468faf',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#012a4a',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cfe7f2',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
  },
  button: {
    height: 48,
    backgroundColor: '#01497c',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#01497c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
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
    color: '#468faf',
  },
  successCard: {
    backgroundColor: '#eef7fa',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    color: '#012a4a',
    lineHeight: 20,
  },
  spamNote: {
    fontSize: 12,
    color: '#2a6f97',
  },
});

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
import { signIn } from '../services/auth.service';
import { colors } from '../../../src/theme';

export default function LoginPage() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  async function handleSignIn() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
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

        <Text style={styles.headline}>Welcome back</Text>
        <Text style={styles.subheading}>Sign in to your workspace</Text>

        <View style={styles.form}>
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
            placeholder="••••••••••"
            value={password}
            onChangeText={setPassword}
            required
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkHighlight}>Create one</Text>
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
    marginBottom: 40,
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
    marginBottom: 32,
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
    color: colors.darkAmethyst[600],
    fontWeight: '600',
  },
});

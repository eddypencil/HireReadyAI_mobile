import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';


export default function ForgotPasswordPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
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
      setError(t('forgot_password.enter_email'));
      return;
    }
    if (!isValidEmail(email.trim())) {
      setError(t('forgot_password.invalid_email'));
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
      setError(err.message || t('forgot_password.failed'));
    } finally {
      setLoading(false);
    }
  }

  const s = {
    flex: { flex: 1, backgroundColor: c.sidebar },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
    branding: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 56, height: 56, borderRadius: 14, backgroundColor: c['sidebar-active'], alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    logoText: { fontSize: 24, fontWeight: '800', color: c['destructive-foreground'] },
    appName: { fontSize: 28, fontWeight: '700', color: c['sidebar-foreground'], letterSpacing: -0.5 },
    aiHighlight: { color: c.accent },
    headline: { fontSize: 26, fontWeight: '700', color: c['sidebar-foreground'], marginBottom: 4 },
    subheading: { fontSize: 14, color: c['sidebar-foreground'], marginBottom: 32 },
    emailHighlight: { fontWeight: '600', color: c['sidebar-foreground'] },
    form: { gap: 16 },
    fieldGroup: { gap: 6 },
    label: { fontSize: 12, fontWeight: '600', color: c['sidebar-foreground'], letterSpacing: 0.5 },
    input: { width: '100%', height: 44, borderRadius: 12, paddingHorizontal: 16, fontSize: 14, color: c.foreground, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
    errorContainer: { backgroundColor: `${c.destructive}1a`, borderWidth: 1, borderColor: `${c.destructive}33`, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    errorText: { fontSize: 13, color: c.destructive },
    button: { height: 48, backgroundColor: c.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c['destructive-foreground'], fontSize: 15, fontWeight: '600' },
    linkContainer: { alignItems: 'center', marginTop: 8, paddingVertical: 12 },
    linkText: { fontSize: 13, color: c['muted-foreground'] },
    successCard: { backgroundColor: c['surface-muted'], borderRadius: 12, padding: 16, gap: 8 },
    successText: { fontSize: 14, color: c.foreground, lineHeight: 20 },
    spamNote: { fontSize: 12, color: c['sidebar-foreground'] },
  };

  if (submitted) {
    return (
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={s.container}>
            <View style={s.branding}>
              <View style={s.logo}>
                <Text style={s.logoText}>H</Text>
              </View>
              <Text style={s.appName}>
                HireReady<Text style={s.aiHighlight}>AI</Text>
              </Text>
            </View>

            <Text style={s.headline}>{t('forgot_password.check_inbox')}</Text>
            <Text style={s.subheading}>
              {t('forgot_password.sent_to')}{' '}
              <Text style={s.emailHighlight}>{email}</Text>
            </Text>

            <View style={s.form}>
              <View style={s.successCard}>
                <Text style={s.successText}>
                  {t('forgot_password.check_instructions')}
                </Text>
                <Text style={s.spamNote}>
                  {t('forgot_password.spam_note')}
                </Text>
              </View>

              <TouchableOpacity
                style={s.button}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <Text style={s.buttonText}>{t('forgot_password.back_to_sign_in')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={s.container}>
          <View style={s.branding}>
            <View style={s.logo}>
              <Text style={s.logoText}>H</Text>
            </View>
            <Text style={s.appName}>
              HireReady<Text style={s.aiHighlight}>AI</Text>
            </Text>
          </View>

          <Text style={s.headline}>{t('forgot_password.title')}</Text>
          <Text style={s.subheading}>{t('forgot_password.subtitle')}</Text>

          <View style={s.form}>
            <View style={s.fieldGroup}>
              <Text style={s.label}>{t('forgot_password.email')}</Text>
              <TextInput
                style={s.input}
                placeholder="you@gmail.com"
                placeholderTextColor={c['muted-foreground']}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {error && (
              <View style={s.errorContainer}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.button, loading && s.buttonDisabled]}
              onPress={handleSendReset}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={c['destructive-foreground']} size="small" />
              ) : (
                <Text style={s.buttonText}>{t('forgot_password.send_reset')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={s.linkContainer}
            >
              <Text style={s.linkText}>{t('forgot_password.back_to_sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

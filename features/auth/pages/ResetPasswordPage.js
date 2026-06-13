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
import { FONT_FAMILY, FONT_FAMILY_BOLD, FONT_FAMILY_EXTRABOLD, FONT_FAMILY_SEMIBOLD } from '../../../src/fonts';

export default function ResetPasswordPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleReset() {
    setError(null);
    if (!newPassword || !confirmPassword) {
      setError(t('reset_password.fill_fields'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('reset_password.password_min'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('reset_password.password_mismatch'));
      return;
    }
    setLoading(true);
    try {
      const { supabase } = require('../../../shared/services/supabase');
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || t('reset_password.failed'));
    } finally {
      setLoading(false);
    }
  }

  const s = {
    flex: { flex: 1, backgroundColor: c.sidebar },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
    branding: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 56, height: 56, borderRadius: 14, backgroundColor: c['sidebar-active'], alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    logoText: { fontSize: 24, fontFamily: FONT_FAMILY_EXTRABOLD, color: c['destructive-foreground'] },
    appName: { fontSize: 28, fontFamily: FONT_FAMILY_BOLD, color: c['sidebar-foreground'], letterSpacing: -0.5 },
    aiHighlight: { color: c.accent },
    headline: { fontSize: 26, fontFamily: FONT_FAMILY_BOLD, color: c['sidebar-foreground'], marginBottom: 4 },
    subheading: { fontSize: 14, fontFamily: FONT_FAMILY, color: c.accent, marginBottom: 32 },
    form: { gap: 16 },
    fieldGroup: { gap: 6 },
    label: { fontSize: 12, fontFamily: FONT_FAMILY_SEMIBOLD, color: c['sidebar-foreground'], letterSpacing: 0.5 },
    input: { width: '100%', height: 44, borderRadius: 12, paddingHorizontal: 16, fontSize: 14, fontFamily: FONT_FAMILY, color: c.foreground, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
    errorContainer: { backgroundColor: `${c.destructive}1a`, borderWidth: 1, borderColor: `${c.destructive}33`, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    errorText: { fontSize: 13, fontFamily: FONT_FAMILY, color: c.destructive },
    button: { height: 48, backgroundColor: c.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c['destructive-foreground'], fontSize: 15, fontFamily: FONT_FAMILY_SEMIBOLD },
    linkContainer: { alignItems: 'center', marginTop: 8, paddingVertical: 12 },
    linkText: { fontSize: 13, fontFamily: FONT_FAMILY, color: c['muted-foreground'] },
  };

  if (success) {
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

            <Text style={s.headline}>{t('reset_password.success_title')}</Text>
            <Text style={s.subheading}>{t('reset_password.success_subtitle')}</Text>

            <View style={s.form}>
              <TouchableOpacity
                style={s.button}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <Text style={s.buttonText}>{t('reset_password.go_to_sign_in')}</Text>
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

          <Text style={s.headline}>{t('reset_password.title')}</Text>
          <Text style={s.subheading}>{t('reset_password.subtitle')}</Text>

          <View style={s.form}>
            <View style={s.fieldGroup}>
              <Text style={s.label}>{t('reset_password.new_password')}</Text>
              <TextInput
                style={s.input}
                placeholder={t('reset_password.password_placeholder')}
                placeholderTextColor={c['muted-foreground']}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>{t('reset_password.confirm_password')}</Text>
              <TextInput
                style={s.input}
                placeholder={t('reset_password.confirm_placeholder')}
                placeholderTextColor={c['muted-foreground']}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {error && (
              <View style={s.errorContainer}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.button, loading && s.buttonDisabled]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={c['destructive-foreground']} size="small" />
              ) : (
                <Text style={s.buttonText}>{t('reset_password.reset')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={s.linkContainer}
            >
              <Text style={s.linkText}>{t('reset_password.back_to_sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FormField from '../../../shared/ui/FormField';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
import LanguageSwitcher from '../../../shared/i18n/LanguageSwitcher';
import { USER_ROLE } from '../../../shared/constants/enums';
import { useUser } from '../context/user.context';

const ROLES = [
  { labelKey: 'sign_up.applicant', value: USER_ROLE.applicant },
  { labelKey: 'sign_up.recruiter', value: USER_ROLE.recruiter },
];

export default function RegisterPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const navigation = useNavigation();
  const { signUpUser } = useUser();
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
      setError(t('sign_up.fill_fields'));
      return;
    }

    if (password.length < 8) {
      setError(t('sign_up.password_min'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('sign_up.password_mismatch'));
      return;
    }

    setLoading(true);
    try {
      await signUpUser(email.trim(), password, {
        fullName: fullName.trim(),
        role: role,
        phone: "",
        headline: "",
        isActive: true,
      });
    } catch (err) {
      setError(err.message || t('sign_up.generic_error'));
    } finally {
      setLoading(false);
    }
  }

  const s = {
    flex: { flex: 1, backgroundColor: c.sidebar },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
    branding: { alignItems: 'center', marginBottom: 32 },
    logo: { width: 56, height: 56, borderRadius: 14, backgroundColor: c['sidebar-active'], alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    logoText: { fontSize: 24, fontWeight: '800', color: c['destructive-foreground'] },
    appName: { fontSize: 28, fontWeight: '700', color: c['sidebar-foreground'], letterSpacing: -0.5 },
    aiHighlight: { color: c.accent },
    headline: { fontSize: 26, fontWeight: '700', color: c['sidebar-foreground'], marginBottom: 4 },
    subheading: { fontSize: 14, color: c.accent, marginBottom: 24 },
    roleToggle: { flexDirection: 'row', gap: 8, padding: 4, borderRadius: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, marginBottom: 24 },
    roleOption: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    roleOptionActive: { backgroundColor: c.primary },
    roleText: { fontSize: 14, fontWeight: '500', color: c['muted-foreground'] },
    roleTextActive: { color: c['destructive-foreground'], fontWeight: '600' },
    form: { gap: 16 },
    errorContainer: { backgroundColor: `${c.destructive}1a`, borderWidth: 1, borderColor: `${c.destructive}33`, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    errorText: { fontSize: 13, color: c.destructive },
    button: { height: 48, backgroundColor: c.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c['destructive-foreground'], fontSize: 15, fontWeight: '600' },
    linkContainer: { alignItems: 'center', marginTop: 8, paddingVertical: 12 },
    linkText: { fontSize: 13, color: c['muted-foreground'] },
    linkHighlight: { color: c.accent, fontWeight: '600' },
    languageSwitcher: { position: 'absolute', top: 42, end: 22, zIndex: 10 },
  };

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.branding}>
            <View style={s.logo}>
              <Text style={s.logoText}>H</Text>
            </View>
            <Text style={s.appName}>
              HireReady<Text style={s.aiHighlight}>AI</Text>
            </Text>
          </View>

          <Text style={s.headline}>{t('sign_up.title')}</Text>
          <Text style={s.subheading}>{t('sign_up.subtitle')}</Text>

          <View style={s.roleToggle}>
            {ROLES.map(({ labelKey, value }) => (
              <TouchableOpacity
                key={value}
                style={[s.roleOption, role === value && s.roleOptionActive]}
                onPress={() => setRole(value)}
                activeOpacity={0.7}
              >
                <Text style={[s.roleText, role === value && s.roleTextActive]}>
                  {t(labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.form}>
            <FormField
              label={t('sign_up.full_name')}
              type="text"
              placeholder={t('sign_up.name_placeholder')}
              value={fullName}
              onChangeText={setFullName}
              required
            />

            <FormField
              label={t('sign_up.email')}
              type="email"
              placeholder={t('sign_up.email_placeholder')}
              value={email}
              onChangeText={setEmail}
              required
            />

            <FormField
              label={t('sign_up.password')}
              type="password"
              placeholder={t('sign_up.password_placeholder')}
              value={password}
              onChangeText={setPassword}
              required
            />

            <FormField
              label={t('sign_up.confirm_password')}
              type="password"
              placeholder={t('sign_up.confirm_placeholder')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              required
            />

            {error && (
              <View style={s.errorContainer}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.button, loading && s.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={c['destructive-foreground']} size="small" />
              ) : (
                <Text style={s.buttonText}>{t('sign_up.create_account')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={s.linkContainer}
            >
              <Text style={s.linkText}>
                {t('sign_up.has_account')}{' '}
                <Text style={s.linkHighlight}>{t('sign_up.sign_in')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LanguageSwitcher style={s.languageSwitcher} />
    </View>
  );
}

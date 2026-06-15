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
import { useUser } from '../context/user.context';
import LanguageSwitcher from '../../../shared/i18n/LanguageSwitcher';
import SocialButton from '../../../shared/ui/SocialButton';


export default function LoginPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const navigation = useNavigation();
  const { signInUser, signInWithGoogleUser } = useUser();
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
      setError(t('sign_in.fill_fields'));
      return;
    }
    setLoading(true);
    try {
      await signInUser(email.trim(), password);
    } catch (err) {
      setError(err.message || t('sign_in.invalid_credentials'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogleUser();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
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
    subheading: { fontSize: 14, color: c.accent, marginBottom: 32 },
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

          <Text style={s.headline}>{t('sign_in.welcome_back')}</Text>
          <Text style={s.subheading}>{t('sign_in.subtitle')}</Text>

          <View style={s.form}>
            <FormField
              label={t('sign_in.email')}
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChangeText={setEmail}
              required
            />

            <FormField
              label={t('sign_in.password')}
              type="password"
              placeholder="••••••••••"
              value={password}
              onChangeText={setPassword}
              required
            />

            
            {/* <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotContainer}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity> */}

            {error && (
              <View style={s.errorContainer}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.button, loading && s.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={c['destructive-foreground']} size="small" />
              ) : (
                <Text style={s.buttonText}>{t('sign_in.sign_in')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={s.linkContainer}
            >
              <Text style={s.linkText}>
                {t('sign_in.no_account')}{' '}
                <Text style={s.linkHighlight}>{t('sign_in.create_one')}</Text>
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
              <Text style={{ marginHorizontal: 12, fontSize: 12, color: c['muted-foreground'] }}>{t('sign_in.or')}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
            </View>

            <SocialButton
              provider="google"
              onClick={handleGoogleSignIn}
              loading={loading}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LanguageSwitcher style={s.languageSwitcher} />
    </View>
  );
}



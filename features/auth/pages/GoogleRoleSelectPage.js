import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../shared/services/supabase';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
import { useUser } from '../../../features/auth/context/user.context';
import { USER_ROLE } from '../../../shared/constants/enums';

export default function GoogleRoleSelectPage({ route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const navigation = useNavigation();
  const { completeRoleSelection } = useUser();
  const user = route?.params?.user;

  const ROLES = [
    { label: t('google_role_select.role_applicant'), value: USER_ROLE.applicant, desc: t('google_role_select.desc_applicant') },
    { label: t('google_role_select.role_recruiter'), value: USER_ROLE.recruiter, desc: t('google_role_select.desc_recruiter') },
  ];

  const [role, setRole] = useState(USER_ROLE.applicant);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    if (!user) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email,
        role,
        is_active: true,
      }]);
      if (profileError) throw profileError;
      await completeRoleSelection(user.id, navigation);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const s = {
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48, backgroundColor: c.sidebar },
    headline: { fontSize: 26, fontWeight: '700', color: c['sidebar-foreground'], textAlign: 'center', marginBottom: 4 },
    subheading: { fontSize: 14, color: c.accent, textAlign: 'center', marginBottom: 32 },
    card: { padding: 16, borderRadius: 12, borderWidth: 2, marginBottom: 12, ...theme.shadow.sm },
    cardActive: { borderColor: c.accent, backgroundColor: c.card },
    cardInactive: { borderColor: c.border, backgroundColor: c.background },
    cardLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    cardDesc: { fontSize: 12, color: c['muted-foreground'] },
    errorContainer: { backgroundColor: `${c.destructive}1a`, borderWidth: 1, borderColor: `${c.destructive}33`, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginTop: 16 },
    errorText: { fontSize: 13, color: c.destructive },
    button: { height: 48, backgroundColor: c.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c['destructive-foreground'], fontSize: 15, fontWeight: '600' },
  };

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.headline}>{t('google_role_select.title')}</Text>
      <Text style={s.subheading}>{t('google_role_select.subtitle')}</Text>

      {ROLES.map(({ label, value, desc }) => (
        <TouchableOpacity
          key={value}
          style={[s.card, role === value ? s.cardActive : s.cardInactive]}
          onPress={() => setRole(value)}
          activeOpacity={0.7}
        >
          <Text style={[s.cardLabel, { color: role === value ? c['sidebar-foreground'] : c['muted-foreground'] }]}>
            {label}
          </Text>
          <Text style={s.cardDesc}>{desc}</Text>
        </TouchableOpacity>
      ))}

      {error && (
        <View style={s.errorContainer}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[s.button, loading && s.buttonDisabled]}
        onPress={handleConfirm}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={c['destructive-foreground']} size="small" />
        ) : (
          <Text style={s.buttonText}>{t('google_role_select.get_started')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

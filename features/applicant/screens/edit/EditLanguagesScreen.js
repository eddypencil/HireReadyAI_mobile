// features/applicant/screens/edit/EditLanguagesScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { addLanguage, updateLanguage } from '../../services/languages.service';
import { Language } from '../../models';
import { FONT_FAMILY, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from '../../../../src/fonts';

const LEVELS = ['basic', 'conversational', 'fluent', 'native'];

const LEVEL_COLORS = {
  basic:          { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  conversational: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
  fluent:         { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  native:         { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
};

export default function EditLanguagesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const navigation = useNavigation();
  const { profileId, item, itemIndex } = useRoute().params || {};
  const isEdit = item != null && itemIndex != null;

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(item?.name || '');
  const [level, setLevel] = useState(item?.level || 'conversational');

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert(t("profile.error_title"), t("profile.edit.error_language_name")); return; }
    setSaving(true);
    try {
      const lang = new Language({ name: name.trim(), level });
      if (isEdit) {
        await updateLanguage(profileId, itemIndex, lang.toJson());
      } else {
        await addLanguage(profileId, lang.toJson());
      }
      navigation.goBack();
    } catch {
      Alert.alert(t("profile.error_title"), t("profile.edit.error_save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("profile.edit.language_name")}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t("profile.edit.language_placeholder")}
            placeholderTextColor={c['muted-foreground']}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("profile.edit.proficiency_level")}</Text>
          <View style={styles.levelsContainer}>
            {LEVELS.map(key => {
              const cfg = LEVEL_COLORS[key];
              const active = level === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.levelCard,
                    { borderColor: active ? cfg.border : c.border },
                    active && { backgroundColor: cfg.bg },
                  ]}
                  onPress={() => setLevel(key)}
                  activeOpacity={0.75}
                >
                  <View style={styles.levelCardTop}>
                    <Text style={[styles.levelLabel, { color: active ? cfg.text : c.foreground }]}>
                      {t("profile.levels." + key)}
                    </Text>
                    {active && (
                      <View style={[styles.levelCheck, { backgroundColor: cfg.text }]}>
                        <Ionicons name="checkmark" size={10} color={c.white} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.levelDesc, { color: active ? cfg.text : c['muted-foreground'] }]}>
                    {t("profile.edit.level_descs." + key)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={c.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? t("profile.save_changes") : t("profile.edit.add_language")}</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
  scroll: { flex: 1, backgroundColor: c.surface },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  fieldGroup: { gap: 10 },
  label: { fontFamily: FONT_FAMILY_SEMIBOLD, fontSize: 12, color: c.foreground, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { fontFamily: FONT_FAMILY, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: c.foreground },
  levelsContainer: { gap: 10 },
  levelCard: { borderWidth: 2, borderRadius: 14, padding: 14, backgroundColor: c.card },
  levelCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  levelLabel: { fontSize: 14, fontFamily: FONT_FAMILY_BOLD },
  levelCheck: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  levelDesc: { fontSize: 12, lineHeight: 17, fontFamily: FONT_FAMILY },
  saveBtn: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4, shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { fontFamily: FONT_FAMILY_BOLD, color: c.white, fontSize: 15 },
  });
}
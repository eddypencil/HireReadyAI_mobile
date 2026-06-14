// features/applicant/screens/edit/EditSkillsScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useThemedAlert } from '../../../../shared/context/ThemedAlertContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useTranslation } from '../../../../shared/context/I18nContext';
import { addSkill, updateSkill } from '../../services/skills.service';
import { Skill } from '../../models';


const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

const LEVEL_CONFIG = {
  beginner:     { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  intermediate: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
  advanced:     { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  expert:       { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
};

export default function EditSkillsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { alert } = useThemedAlert();
  const c = theme.colors;
  const styles = createStyles(c);
  const navigation = useNavigation();
  const route = useRoute();
  const { profileId, item, itemIndex, onSave } = route.params || {};
  const isEdit = item != null && itemIndex != null;

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(item?.name || '');
  const [level, setLevel] = useState(item?.level || 'intermediate');

  const handleSave = async () => {
    if (!name.trim()) { alert(t("profile.error_title"), t("profile.edit.error_skill_name")); return; }

    setSaving(true);
    try {
      const skill = new Skill({ name: name.trim(), level });

      if (isEdit) {
        await updateSkill(profileId, itemIndex, skill.toJson());
      } else {
        await addSkill(profileId, skill.toJson());
      }

      onSave?.();
      navigation.goBack();
    } catch {
      alert(t("profile.error_title"), t("profile.edit.error_save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Skill name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("profile.edit.skill_name")}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. React Native"
            placeholderTextColor={c['muted-foreground']}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Level picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("profile.edit.proficiency_level")}</Text>
          <View style={styles.levelsGrid}>
            {LEVELS.map(l => {
              const cfg = LEVEL_CONFIG[l];
              const active = level === l;
              return (
                <TouchableOpacity
                  key={l}
                  style={[
                    styles.levelCard,
                    { borderColor: active ? cfg.border : c.border },
                    active && { backgroundColor: cfg.bg },
                  ]}
                  onPress={() => setLevel(l)}
                  activeOpacity={0.75}
                >
                  {active && (
                    <View style={[styles.levelCheck, { backgroundColor: cfg.text }]}>
                      <Ionicons name="checkmark" size={10} color={c.white} />
                    </View>
                  )}
                  <Text style={[styles.levelCardLabel, { color: active ? cfg.text : c.foreground }]}>
                    {t("profile.levels." + l)}
                  </Text>
                  <Text style={[styles.levelCardDesc, { color: active ? cfg.text : c['muted-foreground'] }]}>
                    {t("profile.edit.level_descs." + l)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave} disabled={saving} activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={c.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? t("profile.save_changes") : t("profile.edit.add_skill")}</Text>}
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
  label: { fontWeight: '600', fontSize: 12, color: c.foreground, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: c.foreground,
  },
  levelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  levelCard: {
    width: '47%', borderWidth: 2, borderRadius: 14,
    padding: 14, gap: 4, backgroundColor: c.card,
    position: 'relative',
  },
  levelCheck: {
    position: 'absolute', top: 10, right: 10,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  levelCardLabel: { fontWeight: '700', fontSize: 14 },
  levelCardDesc: { fontSize: 11, lineHeight: 16 },
  saveBtn: {
    backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
    shadowColor: c.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { fontWeight: '700', color: c.white, fontSize: 15 },
  });
}
// features/applicant/screens/edit/EditSkillsScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme';
import { addSkill, updateSkill } from '../../services/skills.service';
import { Skill } from '../../models';

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

const LEVEL_CONFIG = {
  beginner:     { bg: '#fef9c3', text: '#854d0e', border: '#fde047', label: 'Beginner',     desc: 'Just started learning' },
  intermediate: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd', label: 'Intermediate', desc: 'Working knowledge' },
  advanced:     { bg: '#dcfce7', text: '#15803d', border: '#86efac', label: 'Advanced',     desc: 'Strong command' },
  expert:       { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd', label: 'Expert',       desc: 'Deep expertise' },
};

export default function EditSkillsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { profileId, item, itemIndex, onSave } = route.params || {};
  const isEdit = item != null && itemIndex != null;

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(item?.name || '');
  const [level, setLevel] = useState(item?.level || 'intermediate');

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Skill name is required.'); return; }

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
      Alert.alert('Error', 'Could not save skill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Skill name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Skill Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. React Native"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Level picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Proficiency Level</Text>
          <View style={styles.levelsGrid}>
            {LEVELS.map(l => {
              const cfg = LEVEL_CONFIG[l];
              const active = level === l;
              return (
                <TouchableOpacity
                  key={l}
                  style={[
                    styles.levelCard,
                    { borderColor: active ? cfg.border : colors.border },
                    active && { backgroundColor: cfg.bg },
                  ]}
                  onPress={() => setLevel(l)}
                  activeOpacity={0.75}
                >
                  {active && (
                    <View style={[styles.levelCheck, { backgroundColor: cfg.text }]}>
                      <Ionicons name="checkmark" size={10} color={colors.white} />
                    </View>
                  )}
                  <Text style={[styles.levelCardLabel, { color: active ? cfg.text : colors.foreground }]}>
                    {cfg.label}
                  </Text>
                  <Text style={[styles.levelCardDesc, { color: active ? cfg.text : colors.mutedForeground }]}>
                    {cfg.desc}
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
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Skill'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  fieldGroup: { gap: 10 },
  label: { fontSize: 12, fontWeight: '600', color: colors.foreground, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.foreground,
  },
  levelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  levelCard: {
    width: '47%', borderWidth: 2, borderRadius: 14,
    padding: 14, gap: 4, backgroundColor: colors.white,
    position: 'relative',
  },
  levelCheck: {
    position: 'absolute', top: 10, right: 10,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  levelCardLabel: { fontSize: 14, fontWeight: '700' },
  levelCardDesc: { fontSize: 11, lineHeight: 16 },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
// features/applicant/components/feedback/StageSelector.js
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { FONT_FAMILY_SEMIBOLD } from '../../../../src/fonts';

const ICONS = {
  hr_interview: 'chatbubble-outline',
  technical_interview: 'desktop-outline',
  assessment: 'bulb-outline', assessment_test: 'bulb-outline',
  coding_test: 'code-slash-outline', video_interview: 'videocam-outline',
  manager_interview: 'chatbubble-outline', ai_screening: 'sparkles-outline',
};

export default function StageSelector({ stages, activeStage, onSelect }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  if (stages.length <= 1) return null;
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {stages.map(stage => {
            const icon = ICONS[stage.recruitment_stages?.stage_type] || 'help-circle-outline';
            const active = activeStage?.id === stage.id;
            return (
              <TouchableOpacity
                key={stage.id}
                onPress={() => onSelect(stage)}
                style={[styles.tab, active && styles.tabActive]}
                activeOpacity={0.7}
              >
                <Ionicons name={icon} size={14} color={active ? c.primary : c['muted-foreground']} />
                <Text style={[styles.label, active && styles.labelActive]}>
                  {stage.recruitment_stages?.name || 'Unknown'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
  container: { borderBottomWidth: 1, borderBottomColor: c.border },
  row: { flexDirection: 'row' },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 13,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: c.primary },
  label: { fontSize: 13, color: c['muted-foreground'], fontFamily: FONT_FAMILY_SEMIBOLD },
  labelActive: { color: c.primary, fontFamily: FONT_FAMILY_SEMIBOLD },
});
}

import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../../src/theme';
import { FONT_FAMILY, FONT_FAMILY_SEMIBOLD } from '../../../src/fonts';

export default function JobSearch({ search, setSearch }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;

  const s = {
    container: { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    inputRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
    input: { fontFamily: FONT_FAMILY, flex: 1, fontSize: fontSize.sm, color: c.foreground, paddingVertical: 8 },
    button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: c.primary },
    buttonText: { fontFamily: FONT_FAMILY_SEMIBOLD, color: c['destructive-foreground'], fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  };

  return (
    <View style={s.container}>
      <View style={s.inputRow}>
        <Ionicons name="search" size={18} color={c['muted-foreground']} style={{ marginRight: 2 }} />
        <TextInput
          style={s.input}
          value={search}
          onChangeText={setSearch}
          placeholder="Search jobs by title or department..."
          placeholderTextColor={c['muted-foreground']}
        />
      </View>

      <TouchableOpacity style={s.button} activeOpacity={0.8}>
        <Text style={s.buttonText}>{t('find_jobs')}</Text>
      </TouchableOpacity>
    </View>
  );
}

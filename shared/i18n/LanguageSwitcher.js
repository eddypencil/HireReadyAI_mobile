import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/I18nContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../src/theme';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
];

export default function LanguageSwitcher({ style }) {
  const { theme } = useTheme();
  const { language, setLanguage } = useTranslation();
  const c = theme.colors;

  return (
    <View style={[styles.container, style]}>
      {LANGUAGES.map((l) => (
        <TouchableOpacity
          key={l.code}
          onPress={() => setLanguage(l.code)}
          style={[
            styles.button,
            {
              backgroundColor: language === l.code ? `${c['sidebar-active']}1a` : 'transparent',
            },
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.text,
              { color: language === l.code ? c['sidebar-foreground'] : c['muted-foreground'] },
              language === l.code && { fontWeight: fontWeight.semibold },
            ]}
          >
            {l.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  button: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.lg,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});

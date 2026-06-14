import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../src/theme';

export default function Navbar({ searchQuery, setSearchQuery, onAddJobClick }) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: c.background, borderBottomColor: c.border }]}>
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search"
          size={16}
          color={c['muted-foreground']}
          style={styles.searchIcon}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search jobs by title or department..."
          placeholderTextColor={`${c['muted-foreground']}99`}
          style={[
            styles.searchInput,
            {
              color: c.foreground,
              backgroundColor: c['surface-muted'],
              borderColor: c.border,
            },
          ]}
        />
      </View>

      <TouchableOpacity
        onPress={onAddJobClick}
        style={[styles.addButton, { backgroundColor: c.primary }]}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={16} color={c['destructive-foreground']} />
        <Text style={[styles.addButtonText, { color: c['destructive-foreground'] }]}>Add Job</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    gap: spacing[4],
  },
  searchWrapper: {
    position: 'relative',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -8 }],
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2.5],
    borderRadius: borderRadius.lg,
    ...shadow.sm,
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

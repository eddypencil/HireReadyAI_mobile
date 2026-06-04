import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

export default function Navbar({ searchQuery, setSearchQuery, onAddJobClick }) {
  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search"
          size={16}
          color={colors.gray[400]}
          style={styles.searchIcon}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search jobs by title or department..."
          placeholderTextColor={colors.gray[400]}
          style={styles.searchInput}
        />
      </View>

      <TouchableOpacity
        onPress={onAddJobClick}
        style={styles.addButton}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={16} color={colors.white} />
        <Text style={styles.addButtonText}>Add Job</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
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
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    fontSize: 14,
    color: colors.gray[900],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.darkAmethyst[950],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

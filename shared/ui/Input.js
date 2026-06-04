import { TextInput, StyleSheet } from 'react-native';
import { colors } from '../../src/theme';

export default function Input({ style, ...props }) {
  return (
    <TextInput
      placeholderTextColor={colors.darkAmethyst[400]}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[800],
    backgroundColor: colors.darkAmethyst[900],
    color: colors.white,
    fontSize: 14,
  },
});

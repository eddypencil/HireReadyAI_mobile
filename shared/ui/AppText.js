import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AppText({ style, ...props }) {
  const { theme } = useTheme();
  return <Text style={[{ fontFamily: theme.fontFamily }, style]} {...props} />;
}

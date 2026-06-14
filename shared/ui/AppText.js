import { Text } from 'react-native';

export default function AppText({ style, ...props }) {
  return <Text style={style} {...props} />;
}

import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/user.context';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { profile, loading } = useUser();
  const navigation = useNavigation();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#01497c" />
      </View>
    );
  }

  if (!profile) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, color: '#dc2626', textAlign: 'center' }}>
          You don't have access to this screen.
        </Text>
      </View>
    );
  }

  return children;
}

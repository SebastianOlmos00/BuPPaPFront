import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/services/session';

export default function Index() {
  const { status } = useSession();

  if (status === 'restoring') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#496F5B" />
      </View>
    );
  }

  if (status === 'none') {
    return <Redirect href="/login" />;
  }
  ///login
  if (status === 'guest' || status === 'user') {
    return <Redirect href="/(tabs)/home" />;
  }

  if (status === 'driver') {
    return <Redirect href="/(driver)/DriverView" />;
  }

  if (status === 'admin') {
    return <Redirect href="/(admin)/AdminView" />;
  }

  return null;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F5F0',
  },
});
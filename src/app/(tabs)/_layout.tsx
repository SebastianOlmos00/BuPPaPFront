import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { useSession } from '@/services/session';

export default function TabsLayout() {
  const { status } = useSession();

  if (status === 'restoring') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#496F5B" />
      </View>
    );
  }

  if (status === 'none') {
    return <Redirect href="/login" />;//login
  }

  if (status === 'admin') {
    return <Redirect href="/(admin)/AdminView" />;
  }

  if (status !== 'guest' && status !== 'user') {
    return <Redirect href="/" />;
  }

  return <AppTabs />;
}

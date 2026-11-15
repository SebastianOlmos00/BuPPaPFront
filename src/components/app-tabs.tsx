import { Tabs } from 'expo-router';
import { Image, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundElement,
        },
        tabBarActiveTintColor: colors.tabBarText,
        tabBarInactiveTintColor: colors.tabBarText,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/tabIcons/map.png')}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Recorridos',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/tabIcons/route.png')}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
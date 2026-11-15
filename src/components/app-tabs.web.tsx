import {
  TabList, Tabs,
  TabSlot, TabTrigger,
} from 'expo-router/ui';

import { Map, Route } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs>
      <View style={styles.container}>
        <TabList
          style={[
            styles.sidebar,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Text style={styles.brand}>VoyBus</Text>

          <TabTrigger name="home" href="/home" style={styles.tab}>
            <Map color="#F5F7F8" size={21} />
            <Text style={styles.tabText}>Mapa</Text>
          </TabTrigger>

          <TabTrigger name="explore" href="/explore" style={styles.tab}>
            <Route color="#F5F7F8" size={21} />
            <Text style={styles.tabText}>Recorridos</Text>
          </TabTrigger>
        </TabList>

        <View style={styles.content}>
          <TabSlot />
        </View>
      </View>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 190,
    paddingTop: 25,
    paddingHorizontal: 12,
    gap: 12,
  },
  brand: {
    color: '#F5F7F8',
    fontSize: 21,
    fontWeight: 'bold',
    padding: 12,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 9,
  },
  tabText: {
    color: '#F5F7F8',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});
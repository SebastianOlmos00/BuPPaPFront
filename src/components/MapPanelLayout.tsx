import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MapView from '@/components/map/MapView';

const WIDE_BREAKPOINT = 900;
const PANEL_WIDTH = 420;

interface Props {
  title: string;
  onProfile: () => void;
  summary: ReactNode;
  children: ReactNode;
}

export default function MapPanelLayout({ title, onProfile, summary, children }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

  const profileButton = (
    <Pressable
      onPress={onProfile}
      style={styles.profileButton}
      accessibilityRole="button"
      accessibilityLabel="Abrir mi perfil"
    >
      <Text style={styles.profileIcon}>👤</Text>
    </Pressable>
  );

  // Web / pantalla ancha: mapa a la izquierda, panel a la derecha.
  if (width >= WIDE_BREAKPOINT) {
    return (
      <View style={styles.wideScreen}>
        <View style={styles.mapWide}>
          <MapView />
        </View>
        <View style={styles.sidePanel}>
          <View style={styles.panelHeader}>
            {profileButton}
            <Text style={styles.title}>{title}</Text>
          </View>
          <ScrollView contentContainerStyle={styles.panelContent}>{children}</ScrollView>
        </View>
      </View>
    );
  }

  // App / pantalla angosta: mapa completo y tarjeta inferior expandible.
  return (
    <View style={styles.narrowScreen}>
      <View style={StyleSheet.absoluteFill}>
        <MapView />
      </View>

      <View style={[styles.floatingProfile, { top: insets.top + 12 }]}>{profileButton}</View>

      <View style={[styles.sheet, expanded && styles.sheetExpanded]}>
        <Pressable
          onPress={() => setExpanded(!expanded)}
          style={styles.handleArea}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Ocultar panel' : 'Ver panel completo'}
        >
          <View style={styles.handle} />
          <Text style={styles.handleText}>{expanded ? 'Ocultar ▼' : 'Ver todo ▲'}</Text>
        </Pressable>

        {expanded ? (
          <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent}>
            <Text style={styles.title}>{title}</Text>
            {children}
          </ScrollView>
        ) : (
          <View style={styles.sheetContent}>{summary}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wideScreen: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F7F8' },
  mapWide: { flex: 1 },
  sidePanel: {
    width: PANEL_WIDTH,
    backgroundColor: '#F5F7F8',
    borderLeftWidth: 1,
    borderLeftColor: '#DCE9EC',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE9EC',
    backgroundColor: '#FFFFFF',
  },
  panelContent: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#26343B' },

  narrowScreen: { flex: 1, backgroundColor: '#F5F7F8' },
  floatingProfile: { position: 'absolute', right: 16, zIndex: 2000 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#DCE9EC',
  },
  sheetExpanded: { height: '85%' },
  sheetScroll: { flex: 1 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  handleArea: { alignItems: 'center', paddingVertical: 10 },
  handle: { width: 38, height: 4, borderRadius: 4, backgroundColor: '#C6D8DE' },
  handleText: { fontSize: 12, color: '#526C76', marginTop: 6, fontWeight: '600' },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCE9EC',
    borderWidth: 1,
    borderColor: '#C6D8DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: { fontSize: 21 },
});
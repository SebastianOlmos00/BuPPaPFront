import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/services/session';
import MapView from '@/components/map/MapView';

export default function HomeScreen() {
  const router = useRouter();
  const { status } = useSession();
  const isGuest = status === 'guest';

  return (
    <SafeAreaView style={styles.screen}>
      <MapView />

      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>BuPaP</Text>
          <Text style={styles.subtitle}>Transporte en Antofagasta</Text>
        </View>

        <View style={styles.headerActions}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {isGuest ? 'Invitado' : 'Usuario'}
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Abrir mi perfil"
          >
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.panelHandle} />

        <Text style={styles.panelTitle}>Transporte en el mapa</Text>
        <Text style={styles.panelSubtitle}>
          Datos de demostración · Antofagasta
        </Text>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <Text style={styles.busIcon}>🚌</Text>
            <View>
              <Text style={styles.legendTitle}>3 buses</Text>
              <Text style={styles.legendDescription}>Ubicaciones de prueba</Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <View style={styles.stopIcon} />
            <View>
              <Text style={styles.legendTitle}>3 paraderos</Text>
              <Text style={styles.legendDescription}>Puntos de ejemplo</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  header: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE9EC',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  brand: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#26343B',
  },
  subtitle: {
    fontSize: 12,
    color: '#718087',
    marginTop: 3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  statusBadge: {
    backgroundColor: '#DCE9EC',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
  },
  statusText: {
    color: '#526C76',
    fontSize: 12,
    fontWeight: '600',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCE9EC',
    borderWidth: 1,
    borderColor: '#C6D8DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 21,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#DCE9EC',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 18,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
  },
  panelHandle: {
    width: 38,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#C6D8DE',
    alignSelf: 'center',
    marginBottom: 13,
  },
  panelTitle: {
    color: '#26343B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  panelSubtitle: {
    color: '#718087',
    fontSize: 12,
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  legendItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  busIcon: {
    fontSize: 24,
  },
  // Mismo aspecto que el paradero del mapa (punto celeste con borde oscuro).
  stopIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#B7CBD3',
    borderWidth: 2,
    borderColor: '#3F464D',
    marginHorizontal: 5,
  },
  legendTitle: {
    color: '#26343B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  legendDescription: {
    color: '#718087',
    fontSize: 10,
    marginTop: 3,
  },
});
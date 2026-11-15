import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getAdminSummary } from '@/services/adminOpsServices';
import { ApiError } from '@/services/api';
import { useSession } from '@/services/session';

type Summary = { drivers: number; vehicles: number; activeShifts: number };

const SECTIONS: {
  id: string;
  req: string;
  title: string;
  description: string;
  icon: string;
  count?: keyof Summary;
}[] = [
  { id: 'drivers', req: 'ADM-02', title: 'Conductores', description: 'Cuentas y estado de los conductores.', icon: '👥', count: 'drivers' },
  { id: 'vehicles', req: 'ADM-02', title: 'Vehículos', description: 'Flota, patentes y estado operativo.', icon: '🚌', count: 'vehicles' },
  { id: 'shifts', req: 'ADM-03', title: 'Turnos en curso', description: 'Asignaciones y cumplimiento.', icon: '🗓️', count: 'activeShifts' },
  { id: 'network', req: 'ADM-01', title: 'Líneas y paraderos', description: 'Recorridos, horarios y paraderos.', icon: '🛣️' },
  { id: 'monitor', req: 'ADM-04', title: 'Monitoreo y mapa', description: 'Vehículos en circulación.', icon: '🗺️' },
  { id: 'alerts', req: 'NTF-03', title: 'Avisos', description: 'Turnos sin iniciar e incidencias.', icon: '🔔' },
];

export default function AdminView() {
  const router = useRouter();
  const { user, signOut } = useSession();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    getAdminSummary()
      .then(setSummary)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'No se pudo cargar el resumen.'),
      );
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => setConfirming(true)}
          style={styles.backButton}
          accessibilityLabel="Cerrar sesión"
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.topTitle}>Panel de administración</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <Text style={styles.welcome}>Bienvenido, {user?.name}</Text>

          {error && <Text style={styles.message}>{error}</Text>}

          {confirming && (
            <View style={styles.confirm}>
              <Text style={styles.confirmText}>¿Cerrar sesión y volver al inicio de sesión?</Text>
              <View style={styles.confirmRow}>
                <Pressable style={styles.secondaryButton} onPress={() => setConfirming(false)}>
                  <Text style={styles.secondaryText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.primaryButton} onPress={handleLogout}>
                  <Text style={styles.primaryText}>Cerrar sesión</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Gestión de la operación</Text>

          <View style={styles.grid}>
            {SECTIONS.map((s) => (
              <View key={s.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{s.icon}</Text>
                  </View>
                  <Text style={styles.req}>{s.req}</Text>
                </View>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardDescription}>{s.description}</Text>
                <Text style={styles.cardValue}>
                  {s.count ? (summary ? String(summary[s.count]) : '…') : 'Próximamente'}
                </Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.logoutButton} onPress={() => setConfirming(true)}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7F8' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#26343B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DCE9EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backText: { fontSize: 20, color: '#26343B', fontWeight: 'bold' },
  topTitle: { fontSize: 18, fontWeight: 'bold', color: '#F5F7F8' },
  content: { flexGrow: 1, padding: 20 },
  container: { width: '100%', maxWidth: 850, alignSelf: 'center', gap: 16 },
  welcome: { fontSize: 20, fontWeight: 'bold', color: '#26343B' },
  message: {
    backgroundColor: '#FBE9E7',
    color: '#8A2D1F',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  confirm: {
    backgroundColor: '#DCE9EC',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  confirmText: { color: '#26343B', fontSize: 14, fontWeight: '600' },
  confirmRow: { flexDirection: 'row', gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#26343B' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE9EC',
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#DCE9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  req: { fontSize: 11, color: '#929DA2', fontWeight: '600' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#26343B', marginTop: 12 },
  cardDescription: { fontSize: 12, color: '#718087', marginTop: 4, lineHeight: 18 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#526C76', marginTop: 10 },
  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#26343B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#F5F7F8', fontWeight: 'bold', fontSize: 14 },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C6D8DE',
    backgroundColor: '#F5F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: '#26343B', fontWeight: '600', fontSize: 14 },
  logoutButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#26343B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoutText: { color: '#F5F7F8', fontWeight: 'bold', fontSize: 15 },
});
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/services/session';

const ROLE_LABEL = {
  guest: 'Invitado',
  user: 'Pasajero',
  driver: 'Conductor',
  admin: 'Administrador',
} as const;

const ACCOUNT_ITEMS = [
  { id: 'edit', req: 'ACC-05', title: 'Editar perfil', description: 'Nombre, alias, foto y correo.' },
  { id: 'password', req: 'ACC-04', title: 'Cambiar contraseña', description: 'Actualiza tu contraseña.' },
  { id: 'prefs', req: 'ACC-06', title: 'Preferencias', description: 'Tema y notificaciones.' },
  { id: 'history', req: 'ACC-07', title: 'Historial', description: 'Tus viajes y solicitudes de parada.' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { status, user, signOut } = useSession();
  const [confirming, setConfirming] = useState(false);

  if (status === 'restoring') return null;
  if (status === 'none') return <Redirect href="/login" />;

  const isGuest = status === 'guest';

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} style={styles.backButton} accessibilityLabel="Volver">
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.topTitle}>Mi perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <Text style={styles.name}>{isGuest ? 'Invitado' : user?.name ?? 'Usuario'}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{ROLE_LABEL[status]}</Text>
            </View>
            {!isGuest && user?.email && <Text style={styles.email}>{user.email}</Text>}
          </View>

          {status === 'user' && (
            <>
              <Text style={styles.sectionTitle}>Mi cuenta</Text>
              <View style={styles.menu}>
                {ACCOUNT_ITEMS.map((item) => (
                  <View key={item.id} style={styles.menuItem}>
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuDescription}>{item.description}</Text>
                    </View>
                    <Text style={styles.soon}>Próximamente</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {isGuest && (
            <View style={styles.registerCard}>
              <Text style={styles.registerTitle}>Crea tu cuenta</Text>
              <Text style={styles.registerDescription}>
                Con una cuenta puedes guardar tus favoritos, ver tu historial y recibir avisos de tus
                líneas.
              </Text>
              <Pressable style={styles.primaryButton} onPress={() => router.push('/login')}>
                <Text style={styles.primaryText}>Iniciar sesión o registrarme</Text>
              </Pressable>
            </View>
          )}

          {confirming ? (
            <View style={styles.confirm}>
              <Text style={styles.confirmText}>¿Seguro que quieres cerrar sesión?</Text>
              <View style={styles.confirmRow}>
                <Pressable style={styles.secondaryButton} onPress={() => setConfirming(false)}>
                  <Text style={styles.secondaryText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.primaryButton} onPress={handleSignOut}>
                  <Text style={styles.primaryText}>Cerrar sesión</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.logoutButton} onPress={() => setConfirming(true)}>
              <Text style={styles.primaryText}>Cerrar sesión</Text>
            </Pressable>
          )}
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
  container: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 16 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE9EC',
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCE9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 38 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#26343B', marginTop: 14 },
  badge: {
    backgroundColor: '#DCE9EC',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 6,
    marginTop: 10,
  },
  badgeText: { color: '#526C76', fontSize: 12, fontWeight: '600' },
  email: { color: '#718087', fontSize: 13, marginTop: 12 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#26343B' },
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE9EC',
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F3',
  },
  menuInfo: { flex: 1 },
  menuTitle: { color: '#26343B', fontSize: 15, fontWeight: 'bold' },
  menuDescription: { color: '#718087', fontSize: 12, marginTop: 4 },
  soon: { color: '#929DA2', fontSize: 11, fontWeight: '600' },
  registerCard: { backgroundColor: '#DCE9EC', padding: 20, borderRadius: 16, gap: 8 },
  registerTitle: { fontSize: 17, fontWeight: 'bold', color: '#26343B' },
  registerDescription: { color: '#526C76', fontSize: 13, lineHeight: 20 },
  confirm: { backgroundColor: '#DCE9EC', padding: 16, borderRadius: 14, gap: 12 },
  confirmText: { color: '#26343B', fontSize: 14, fontWeight: '600' },
  confirmRow: { flexDirection: 'row', gap: 10 },
  primaryButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#26343B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryText: { color: '#F5F7F8', fontWeight: 'bold', fontSize: 14 },
  secondaryButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C6D8DE',
    backgroundColor: '#F5F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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
});
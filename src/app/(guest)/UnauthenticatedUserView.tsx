import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/services/session';

export default function UnauthenticatedUserView() {
  const router = useRouter();
  const { guest, signOut } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TerraJut</Text>
      <Text style={styles.subtitle}>Modo invitado</Text>

      <Text style={styles.description}>
        Explora y reconoce rocas sin necesidad de crear una cuenta.
      </Text>

      <Text style={styles.info}>
        Sesión temporal activa
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Iniciar sesión o registrarse</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => signOut()}
      >
        <Text style={styles.secondaryText}>Salir de la sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#263D39',
  },
  subtitle: {
    fontSize: 20,
    color: '#496F5B',
    marginTop: 12,
  },
  description: {
    textAlign: 'center',
    color: '#68746B',
    marginTop: 16,
  },
  info: {
    marginVertical: 24,
    color: '#496F5B',
  },
  button: {
    backgroundColor: '#496F5B',
    padding: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 16,
  },
  secondaryText: {
    color: '#496F5B',
  },
});
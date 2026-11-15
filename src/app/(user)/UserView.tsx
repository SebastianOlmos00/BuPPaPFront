import { useSession } from '@/services/session';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function UserView() {
  const { user, signOut } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TerraJut</Text>
      <Text style={styles.subtitle}>Usuario autenticado</Text>

      <Text style={styles.description}>
        Bienvenido, {user?.userName ?? 'explorador'}.
      </Text>

      <Text style={styles.info}>
        Aquí podrás consultar tu colección, reconocimientos y logros.
      </Text>

      <Pressable style={styles.button} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F2F5F0',
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
    marginTop: 20,
    color: '#34483C',
  },
  info: {
    marginVertical: 20,
    textAlign: 'center',
    color: '#68746B',
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
});
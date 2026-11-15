// ver como dividir a telefono y computador (login.tsx)
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ApiError } from '@/services/api';
import { useSession } from '@/services/session';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, continueAsGuest } = useSession();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Ingresa tu correo y contraseña.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await signIn(email.trim(), password);
      router.replace('/');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof ApiError
          ? error.message
          : 'Ocurrió un error inesperado. Inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await continueAsGuest();
      router.replace('/');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof ApiError
          ? error.message
          : 'No se pudo iniciar la sesión de invitado.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>

          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>◆</Text>
            </View>

            <Text style={styles.brandName}>BuPPaP</Text>

            <Text style={styles.tagline}>
              Descubre el mundo bajo tus pies.
            </Text>

            <Text style={styles.description}>
              Identifica, aprende y construye tu colección
              de rocas y minerales.
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.card}>
            <Text style={styles.title}>Bienvenido de nuevo</Text>

            <Text style={styles.subtitle}>
              Inicia sesión para continuar explorando.
            </Text>

            <Text style={styles.label}>Correo electrónico</Text>

            <TextInput
              style={styles.input}
              placeholder="nombre@correo.com"
              placeholderTextColor="#929DA2"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Contraseña</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#929DA2"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showPassword}>
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Text>
              </Pressable>
            </View>

            {message && (
              <Text
                style={[
                  styles.message,
                  message.type === 'error'
                    ? styles.messageError
                    : styles.messageInfo,
                ]}
                accessibilityRole="alert"
              >
                {message.type === 'error' ? '⚠ ' : ''}
                {message.text}
              </Text>
            )}

            <Pressable
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.registerButton}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.registerButtonText}>
                Crear una cuenta
              </Text>
            </Pressable>

            <View style={styles.guestContainer}>
              <Text style={styles.guestText}>
                ¿Solo quieres explorar?
              </Text>

              <Pressable
                onPress={handleGuest}
                disabled={loading}
              >
                <Text style={styles.guestButton}>
                  Continuar como invitado
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>
            TerraJut · Exploración geológica
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#DCE9EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    color: '#26343B',
  },
  brandName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#26343B',
  },
  tagline: {
    fontSize: 17,
    fontWeight: '600',
    color: '#526C76',
    marginTop: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#65747A',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE9EC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#26343B',
  },
  subtitle: {
    fontSize: 14,
    color: '#718087',
    marginTop: 7,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#26343B',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DCE9EC',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    color: '#26343B',
    backgroundColor: '#F5F7F8',
  },
  passwordContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DCE9EC',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F5F7F8',
  },
  passwordInput: {
    flex: 1,
    color: '#26343B',
  },
  showPassword: {
    color: '#526C76',
    fontWeight: '600',
    fontSize: 12,
  },
  loginButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#26343B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#F5F7F8',
    fontSize: 15,
    fontWeight: 'bold',
  },
  registerButton: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C6D8DE',
    backgroundColor: '#DCE9EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  registerButtonText: {
    color: '#26343B',
    fontWeight: '600',
  },
  guestContainer: {
    alignItems: 'center',
    marginTop: 25,
    gap: 8,
  },
  guestText: {
    color: '#718087',
    fontSize: 13,
  },
  guestButton: {
    color: '#526C76',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    color: '#929DA2',
    fontSize: 12,
    marginTop: 24,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  messageError: {
    backgroundColor: '#FBE9E7',
    color: '#8A2D1F',
  },
  messageInfo: {
    backgroundColor: '#DCE9EC',
    color: '#26343B',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View, } from 'react-native';

import { ApiError } from '@/services/api';
import { registerAccount, resendVerificationCode, verifyAccount } from '@/services/authService';

type Step = 'form' | 'verify' | 'done';
type Msg = { type: 'error' | 'info'; text: string };

const SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

// Misma regla que el backend (C09): 8 a 15 caracteres ASCII, sin espacios.
function passwordProblem(p: string): string | null {
  if (p.length < 8 || p.length > 15) return 'La contraseña debe tener entre 8 y 15 caracteres.';
  if (!/^[\x21-\x7E]+$/.test(p)) return 'La contraseña no puede tener espacios ni caracteres especiales de otros idiomas.';
  if (!/[A-Z]/.test(p)) return 'La contraseña necesita una mayúscula.';
  if (!/[a-z]/.test(p)) return 'La contraseña necesita una minúscula.';
  if (!/\d/.test(p)) return 'La contraseña necesita un número.';
  if (![...p].some((c) => SYMBOLS.includes(c))) return 'La contraseña necesita un símbolo (por ejemplo # o !).';
  return null;
}

const errorText = (e: unknown) =>
  e instanceof ApiError ? e.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.';

export default function RegisterScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<Msg | null>(null);
  const [loading, setLoading] = useState(false);

  const fail = (text: string) => setMessage({ type: 'error', text });

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/login'));

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) return fail('Ingresa tu nombre (mínimo 2 caracteres).');
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return fail('Ingresa un correo válido.');
    const problem = passwordProblem(password);
    if (problem) return fail(problem);
    if (password !== confirm) return fail('La confirmación no coincide con la contraseña.');
    if (!accepted) return fail('Debes aceptar los términos de privacidad.');

    setLoading(true);
    setMessage(null);
    try {
      await registerAccount({
        name: cleanName,
        email: cleanEmail,
        password,
        confirmPassword: confirm,
      });
      setEmail(cleanEmail);
      setStep('verify');
      setMessage({ type: 'info', text: 'Te enviamos un código de 6 dígitos a tu correo.' });
    } catch (e) {
      fail(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) return fail('El código tiene 6 dígitos.');
    setLoading(true);
    setMessage(null);
    try {
      await verifyAccount(email, code);
      setStep('done');
    } catch (e) {
      fail(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await resendVerificationCode(email);
      setMessage({ type: 'info', text: 'Si corresponde, enviamos un código nuevo. Puedes pedir otro cada 60 segundos.' });
    } catch (e) {
      fail(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Pressable onPress={goBack} style={styles.backButton} accessibilityLabel="Volver">
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.topTitle}>Crear cuenta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.card}>
            {message && (
              <Text
                style={[styles.message, message.type === 'error' ? styles.messageError : styles.messageInfo]}
                accessibilityRole="alert"
              >
                {message.text}
              </Text>
            )}

            {step === 'form' && (
              <>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor="#929DA2"
                  value={name}
                  onChangeText={setName}
                />

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
                    placeholder="8 a 15 caracteres"
                    placeholderTextColor="#929DA2"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.showPassword}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
                  </Pressable>
                </View>
                <Text style={styles.hint}>
                  Incluye mayúscula, minúscula, número y símbolo, sin espacios.
                </Text>

                <Text style={styles.label}>Confirmar contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repite la contraseña"
                  placeholderTextColor="#929DA2"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />

                <Pressable style={styles.checkRow} onPress={() => setAccepted(!accepted)}>
                  <View style={[styles.checkBox, accepted && styles.checkBoxOn]}>
                    {accepted && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={styles.checkText}>Acepto los términos de privacidad</Text>
                </Pressable>

                <Pressable
                  style={[styles.primaryButton, loading && styles.disabled]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <Text style={styles.primaryText}>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</Text>
                </Pressable>
              </>
            )}

            {step === 'verify' && (
              <>
                <Text style={styles.title}>Verifica tu correo</Text>
                <Text style={styles.subtitle}>Código enviado a {email}</Text>

                <Text style={styles.label}>Código de 6 dígitos</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  placeholderTextColor="#929DA2"
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <Pressable
                  style={[styles.primaryButton, loading && styles.disabled]}
                  onPress={handleVerify}
                  disabled={loading}
                >
                  <Text style={styles.primaryText}>{loading ? 'Verificando...' : 'Verificar cuenta'}</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={handleResend} disabled={loading}>
                  <Text style={styles.secondaryText}>Reenviar código</Text>
                </Pressable>
              </>
            )}

            {step === 'done' && (
              <>
                <Text style={styles.title}>¡Cuenta verificada!</Text>
                <Text style={styles.subtitle}>Ya puedes iniciar sesión con tu correo y contraseña.</Text>
                <Pressable style={styles.primaryButton} onPress={() => router.replace('/login')}>
                  <Text style={styles.primaryText}>Ir a iniciar sesión</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  container: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE9EC',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#26343B' },
  subtitle: { fontSize: 14, color: '#718087', marginTop: 7, marginBottom: 22 },
  label: { fontSize: 14, fontWeight: '600', color: '#26343B', marginBottom: 8 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DCE9EC',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
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
    marginBottom: 8,
    backgroundColor: '#F5F7F8',
  },
  passwordInput: { flex: 1, color: '#26343B' },
  showPassword: { color: '#526C76', fontWeight: '600', fontSize: 12 },
  hint: { fontSize: 12, color: '#718087', marginBottom: 18 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#526C76',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7F8',
  },
  checkBoxOn: { backgroundColor: '#26343B', borderColor: '#26343B' },
  checkMark: { color: '#F5F7F8', fontSize: 14, fontWeight: 'bold' },
  checkText: { color: '#26343B', fontSize: 14, flex: 1 },
  primaryButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#26343B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#F5F7F8', fontSize: 15, fontWeight: 'bold' },
  secondaryButton: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C6D8DE',
    backgroundColor: '#DCE9EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryText: { color: '#26343B', fontWeight: '600' },
  message: { fontSize: 14, lineHeight: 20, padding: 12, borderRadius: 10, marginBottom: 16 },
  messageError: { backgroundColor: '#FBE9E7', color: '#8A2D1F' },
  messageInfo: { backgroundColor: '#DCE9EC', color: '#26343B' },
  disabled: { opacity: 0.6 },
});
// almacenamiento
import * as SecureStore from 'expo-secure-store'; // segun Expo SecureStore te permite guardar pares clave–valor de forma segura en el dispositivo, ideal para datos sensibles como tokens, contraseñas o configuraciones privadas.
import { Platform } from 'react-native';

// SecureStore guarda en el almacen seguro del telefono; en web no existe, asi que ahi se usa localStorage.
const isWeb = Platform.OS === 'web';
const hasLocalStorage = () => typeof localStorage !== 'undefined';

export async function saveItem(key: string, value: string) {
  if (isWeb) {
    if (hasLocalStorage()) localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function readItem(key: string) {
  if (isWeb) return hasLocalStorage() ? localStorage.getItem(key) : null;
  return SecureStore.getItemAsync(key);
}

export async function removeItem(key: string) {
  if (isWeb) {
    if (hasLocalStorage()) localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
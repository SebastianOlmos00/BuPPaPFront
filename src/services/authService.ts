import { ApiError, api, setApiAuthToken } from './api';
import { readItem, removeItem, saveItem } from './storage';

const TOKEN_KEY = 'terrajut_token';

export type UserRole = 'PASSENGER' | 'DRIVER' | 'ADMIN';

export interface User {
  id: number;
  role: UserRole;
  name: string;
  alias?: string | null;
  email: string | null;
  phone: string | null;
  authProvider?: string;
  photoUrl?: string | null;
  verifiedAt?: string | null;
  twoFactorEnabled?: boolean;
  createdAt?: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface MigrationResult {
  migrated: boolean;
  message?: string;
  collectionRows?: number;
  achievements?: number;
}

interface RegisterResponse {
  message: string;
  user: User;
  migration: MigrationResult | null;
}

export const isAdmin = (user: User | null) => user?.role === 'ADMIN';

export const isDriver = (user: User | null) => user?.role === 'DRIVER';

export const isPassenger = (user: User | null) => user?.role === 'PASSENGER';

export function getCurrentUser() {
  return api.get<User>('/me');
}

export async function loginUser(email: string, password: string) {
  const response = await api.post<LoginResponse>('/auth/login', {
  identifier: email,
  password,
  });
  setApiAuthToken(response.token);
  await saveItem(TOKEN_KEY, response.token);

  try {
    const user = await getCurrentUser();
    return { token: response.token, user };
  } catch (error) {
    await logoutUser();
    throw error;
  }
}

export function registerUser(data: {
  userName: string;
  email: string;
  password: string;
  phone?: string;
  guestToken?: string;
}) {
  return api.post<RegisterResponse>('/user/registro', data);
}

export async function restoreSession() {
  const token = await readItem(TOKEN_KEY);
  if (!token) return null;

  setApiAuthToken(token);
  try {
    const user = await getCurrentUser();
    return { token, user };
  } catch (error) {

    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      await logoutUser();
    }
    return null;
  }
}

export async function logoutUser() {
  setApiAuthToken(null);
  await removeItem(TOKEN_KEY);
}

export async function migrateGuestProgress(): Promise<MigrationResult> {
  try {
    const result = await api.post<{ message: string; collectionRows: number; achievements: number }>('/guest/migrate');
    return { migrated: true, collectionRows: result.collectionRows, achievements: result.achievements };
  } catch (error) {
    return { migrated: false, message: error instanceof ApiError ? error.message : 'No se pudo transferir el progreso.' };
  }
}

export function registerAccount(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return api.post<{ registered: boolean; message: string; userId: number }>('/auth/register', {
    ...data,
    termsAccepted: true,
  });
}

export function verifyAccount(email: string, code: string) {
  return api.post('/auth/verify', { email, code });
}

export function resendVerificationCode(email: string) {
  return api.post('/auth/resend-code', { email });
}
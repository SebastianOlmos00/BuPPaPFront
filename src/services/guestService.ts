import { ApiError, api, setApiGuestToken } from './api';
import { readItem, removeItem, saveItem } from './storage';

const GUEST_KEY = 'terrajut_guest_token';

// Estado de la sesion temporal, tal como lo entrega GET /guest/session.
export interface GuestInfo {
  status: string;
  recognitionCount: number;
  limit: number;
  remaining: number;
  expiresAt: string;
}

type CreateGuestResponse = GuestInfo & { token: string };

export const getStoredGuestToken = () => readItem(GUEST_KEY);

export function getGuestInfo() {
  return api.get<GuestInfo>('/guest/session');
}

export async function startGuestSession() {
  const { token, ...info } = await api.post<CreateGuestResponse>('/guest/sessions');
  setApiGuestToken(token);
  await saveItem(GUEST_KEY, token);
  return info as GuestInfo;
}

// Restaura la sesion de invitado guardada; devuelve null si ya no es valida.
export async function restoreGuestSession() {
  const token = await getStoredGuestToken();
  if (!token) return null;

  setApiGuestToken(token);
  try {
    return await getGuestInfo();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) await endGuestSession();
    return null;
  }
}

export async function endGuestSession() {
  setApiGuestToken(null);
  await removeItem(GUEST_KEY);
}
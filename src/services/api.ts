// La direccion del backend se lee del .env (EXPO_PUBLIC_API_URL): nunca va escrita en el codigo.
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

// Error del backend con su estado HTTP y, si existe, su codigo (por ejemplo GUEST_LIMIT_REACHED).
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

let authToken: string | null = null;
let guestToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  authToken = token;
}

export function setApiGuestToken(token: string | null) {
  guestToken = token;
}

let onSessionExpired: (() => void) | null = null;

// La sesion (session.tsx) registra aqui que debe pasar cuando el backend responde 401 con una sesion activa.
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

async function request<T>(endpoint: string, method: Method, body?: unknown): Promise<T> {
  if (!API_URL) {
    throw new ApiError('Falta configurar EXPO_PUBLIC_API_URL en el archivo .env', 0);
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const bearer = authToken ?? guestToken;
  if (bearer) headers.Authorization = `Bearer ${bearer}`

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexion y la direccion del backend.', 0);
  }

  // DELETE responde 204 sin cuerpo, asi que no siempre hay JSON que leer.
  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // 401 con sesion activa = token vencido o sesion de invitado invalida. El login tambien responde 401 (credenciales incorrectas).
    if (response.status === 401 && (authToken || guestToken) && endpoint !== '/auth/login') onSessionExpired?.();
    throw new ApiError( data?.error?.message || data?.message || `Error ${response.status}`,
      response.status,
      data?.error?.code || data?.code,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, 'GET'),
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, 'POST', body),
  patch: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, 'PATCH', body),
  delete: <T>(endpoint: string) => request<T>(endpoint, 'DELETE'),
};
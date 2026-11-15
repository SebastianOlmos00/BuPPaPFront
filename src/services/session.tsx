import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setSessionExpiredHandler } from './api';
import { isAdmin, isDriver, loginUser, logoutUser,
  migrateGuestProgress, registerUser, restoreSession,
  type MigrationResult, type User,
} from './authService';
import {
    endGuestSession, getGuestInfo, getStoredGuestToken,
    restoreGuestSession, startGuestSession,
    type GuestInfo,
} from './guestService';

export type SessionStatus = | 'restoring' | 'none' | 'guest' | 'user' | 'driver' | 'admin';

interface SessionValue {
  status: SessionStatus;
  user: User | null;
  guest: GuestInfo | null;
  notice: string | null;
  signIn: (email: string, password: string) => Promise<MigrationResult | null>;
  signUp: (data: { userName: string; email: string; password: string; phone?: string }) => Promise<MigrationResult | null>;
  continueAsGuest: () => Promise<void>;
  updateGuest: (info: GuestInfo) => void;
  refreshGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  clearNotice: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('restoring');
  const [user, setUser] = useState<User | null>(null);
  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const applyUser = (next: User) => {
    setUser(next);
    setGuest(null);

    if (isAdmin(next)) {
      setStatus('admin');
    } else if (isDriver(next)) {
      setStatus('driver');
    } else {
      setStatus('user');
    }
  };
  const applyGuest = (info: GuestInfo) => {
    setUser(null);
    setGuest(info);
    setStatus('guest');
  };
  const applyNone = () => {
    setUser(null);
    setGuest(null);
    setStatus('none');
  };

  // Al abrir la app: primero la cuenta guardada y, si no hay, la sesion de invitado guardada.
  useEffect(() => {
    let active = true;
    (async () => {
      const restored = await restoreSession();
      if (!active) return;
      if (restored) {
        applyUser(restored.user);
        return;
      }
      const restoredGuest = await restoreGuestSession();
      if (!active) return;
      if (restoredGuest) applyGuest(restoredGuest);
      else applyNone();
    })();
    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await logoutUser();
    await endGuestSession();
    applyNone();
  }, []);

  // Se registra despues de restaurar, para que un token vencido al abrir la app no dispare este aviso.
  useEffect(() => {
    if (status === 'restoring') return;
    setSessionExpiredHandler(() => {
      setNotice(
        status === 'guest'
          ? 'Tu sesión de invitado expiró. Comienza una nueva para seguir.'
          : 'Tu sesión expiró. Inicia sesión nuevamente.'
      );
      void signOut();
    });
    return () => setSessionExpiredHandler(null);
  }, [status, signOut]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { user: loggedUser } = await loginUser(email, password);
      // Si habia una sesion de invitado, su progreso se transfiere a la cuenta (el backend fusiona colecciones y logros).
      const migration = status === 'guest' ? await migrateGuestProgress() : null;
      await endGuestSession();
      setNotice(null);
      applyUser(loggedUser);
      return migration;
    },
    [status]
  );

  const signUp = useCallback(
    async (data: { userName: string; email: string; password: string; phone?: string }) => {
      const guestToken = status === 'guest' ? (await getStoredGuestToken()) ?? undefined : undefined;
      const registered = await registerUser({ ...data, guestToken });
      const { user: newUser } = await loginUser(data.email, data.password);
      await endGuestSession();
      setNotice(null);
      applyUser(newUser);
      return registered.migration;
    },
    [status]
  );

  const continueAsGuest = useCallback(async () => {
    const info = await startGuestSession();
    setNotice(null);
    applyGuest(info);
  }, []);

  const updateGuest = useCallback((info: GuestInfo) => setGuest(info), []);
  const refreshGuest = useCallback(async () => {
    setGuest(await getGuestInfo());
  }, []);
  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo(
    () => ({ status, user, guest, notice, signIn, signUp, continueAsGuest, updateGuest, refreshGuest, signOut, clearNotice }),
    [status, user, guest, notice, signIn, signUp, continueAsGuest, updateGuest, refreshGuest, signOut, clearNotice]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de SessionProvider');
  return context;
}
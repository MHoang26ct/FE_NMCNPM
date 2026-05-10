import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AuthContext, type User } from "@/lib/auth";
import {
  clearStoredSession,
  loadStoredUser,
  loginApi,
  logoutApi,
  meApi,
  saveStoredSession,
  toUserProfile,
} from "@/lib/api";

function loadUser(): User | null {
  return loadStoredUser();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with null so SSR and initial client render match (no localStorage on server).
  // After hydration, useEffect restores the persisted user from localStorage.
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = loadUser();
    if (saved) {
      setUser(saved);
    } else {
      return;
    }

    const restoreFromApi = async () => {
      try {
        const me = await meApi();
        setUser(toUserProfile(me));
      } catch {
        clearStoredSession();
        setUser(null);
      }
    };

    void restoreFromApi();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const payload = await loginApi(username, password);
      const profile = toUserProfile(payload.user);
      saveStoredSession(payload.accessToken, profile);
      setUser(profile);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Best-effort API logout; local logout is still applied.
    }
    clearStoredSession();
    setUser(null);
  }, []);

  return (
    <AuthContext value={{ user, login, logout }}>
      {children}
    </AuthContext>
  );
}

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AuthContext, attemptLogin, type User } from "@/lib/auth";

const STORAGE_KEY = "cnpmbank_user";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with null so SSR and initial client render match (no localStorage on server).
  // After hydration, useEffect restores the persisted user from localStorage.
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(loadUser());
  }, []);

  const login = useCallback((username: string, password: string) => {
    const u = attemptLogin(username, password);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext value={{ user, login, logout }}>
      {children}
    </AuthContext>
  );
}

import { useState, useCallback, type ReactNode } from "react";
import { AuthContext, attemptLogin, type User } from "@/lib/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((username: string, password: string) => {
    const u = attemptLogin(username, password);
    if (u) {
      setUser(u);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext value={{ user, login, logout }}>
      {children}
    </AuthContext>
  );
}

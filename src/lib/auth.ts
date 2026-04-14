import { createContext, useContext } from "react";

export type UserRole = "nhanvien" | "giamdoc" | "admin";

export interface User {
  username: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Mock users
const MOCK_USERS: Record<string, { password: string; role: UserRole }> = {
  nhanvien: { password: "123456", role: "nhanvien" },
  giamdoc: { password: "123456", role: "giamdoc" },
  admin: { password: "123456", role: "admin" },
};

export function attemptLogin(username: string, password: string): User | null {
  const entry = MOCK_USERS[username];
  if (entry && entry.password === password) {
    return { username, role: entry.role };
  }
  return null;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  login: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

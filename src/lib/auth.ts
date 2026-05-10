import { createContext, useContext } from "react";
import type { UserProfile } from "@/lib/api";

export type UserRole = "nhanvien" | "giamdoc" | "admin";

export type User = UserProfile;

export interface AuthState {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  login: async () => false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

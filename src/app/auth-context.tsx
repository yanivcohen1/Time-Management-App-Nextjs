"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { clearJwtToken, persistJwtToken, readJwtToken } from "@/lib-fe/jwt-storage";

export type Role = "user" | "admin";

type AuthData = {
  id: number;
  username: string;
  role: Role;
};

type AuthState =
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: AuthData };

type LoginPayload = {
  username: string;
  password: string;
};

type AuthContextValue = {
  authState: AuthState;
  login: (payload: LoginPayload) => Promise<{ success: true } | { success: false; message: string }>;
  logout: () => void;
  isHydrated: boolean;
};

const storageKey = "focusflow.auth.state";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredState(): AuthState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const token = readJwtToken();
    if (!token) return null;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthData | null;
    if (!parsed) return null;
    if (
      typeof parsed.id === "number" &&
      parsed.username &&
      (parsed.role === "user" || parsed.role === "admin")
    ) {
      return { status: "authenticated", user: parsed };
    }
  } catch (error) {
    console.warn("Failed to parse auth state", error);
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: "unauthenticated" });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredState();
    if (stored) {
      setAuthState(stored);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (authState.status === "authenticated") {
      window.localStorage.setItem(storageKey, JSON.stringify(authState.user));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [authState]);

  const login = useCallback(async ({ username, password }: LoginPayload) => {
    try {
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });

      const body = response.data as unknown;
      const token =
        typeof body === "object" && body !== null
          ? (() => {
              const { token: tokenCandidate, jwt } = body as {
                token?: unknown;
                jwt?: unknown;
              };
              if (typeof tokenCandidate === "string") return tokenCandidate;
              if (typeof jwt === "string") return jwt;
              return null;
            })()
          : null;

      const user =
        typeof body === "object" && body !== null && "user" in body
          ? (body as { user?: AuthData }).user
          : undefined;

      if (
        !user ||
        typeof user.username !== "string" ||
        (user.role !== "user" && user.role !== "admin") ||
        typeof user.id !== "number"
      ) {
        return { success: false as const, message: "Malformed login response" };
      }

      if (!token) {
        return { success: false as const, message: "Missing token in login response" };
      }

      persistJwtToken(token);

      setAuthState({ status: "authenticated", user });
      return { success: true as const };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { message?: string } | undefined)?.message ??
          "Invalid credentials";
        return { success: false as const, message };
      }

      if (error instanceof Error) {
        return { success: false as const, message: error.message };
      }

      return { success: false as const, message: "Unknown error" };
    }
  }, []);

  const logout = useCallback(() => {
    clearJwtToken();
    setAuthState({ status: "unauthenticated" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      login,
      logout,
      isHydrated,
    }),
    [authState, isHydrated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRoleGuard(roles: Role[]) {
  const { authState } = useAuth();
  const allowed =
    authState.status === "authenticated" && roles.includes(authState.user.role);
  return {
    allowed,
    role: authState.status === "authenticated" ? authState.user.role : undefined,
    isAuthenticated: authState.status === "authenticated",
  };
}

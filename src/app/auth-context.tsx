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

export type Role = "user" | "admin";

type AuthData = {
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
};

const storageKey = "focusflow.auth.state";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const KNOWN_USERS: Record<string, { password: string; role: Role }> = {
  user: { password: "user123", role: "user" },
  admin: { password: "admin123", role: "admin" },
};

function readInitialState(): AuthState {
  if (typeof window === "undefined") {
    return { status: "unauthenticated" };
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return { status: "unauthenticated" };
    const parsed = JSON.parse(raw) as AuthData | null;
    if (!parsed) return { status: "unauthenticated" };
    if (parsed.username && (parsed.role === "user" || parsed.role === "admin")) {
      return { status: "authenticated", user: parsed };
    }
  } catch (error) {
    console.warn("Failed to parse auth state", error);
  }

  return { status: "unauthenticated" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => readInitialState());

  useEffect(() => {
    if (authState.status === "authenticated") {
      window.localStorage.setItem(storageKey, JSON.stringify(authState.user));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [authState]);

  const login = useCallback(async ({ username, password }: LoginPayload) => {
    const record = KNOWN_USERS[username.trim().toLowerCase()];
    if (!record || record.password !== password) {
      return { success: false as const, message: "Invalid credentials" };
    }

    const data: AuthData = {
      username: username.trim(),
      role: record.role,
    };

    setAuthState({ status: "authenticated", user: data });
    return { success: true as const };
  }, []);

  const logout = useCallback(() => {
    setAuthState({ status: "unauthenticated" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      login,
      logout,
    }),
    [authState, login, logout]
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

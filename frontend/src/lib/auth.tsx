import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, authApi, clearToken, getToken, setToken } from "./api";
import type { RegisterPayload, UserMe } from "./types";

/** Where a role lands after auth. */
export function roleHome(role: string | undefined): string {
  return role === "admin" ? "/platform/overview" : "/app/home";
}

interface AuthContextValue {
  user: UserMe | null;
  loading: boolean; // true while the initial session check is in flight
  login: (email: string, password: string) => Promise<UserMe>;
  register: (payload: RegisterPayload) => Promise<UserMe>;
  /** Adopt a token minted by an external flow (e.g. Google sign-in callback). */
  applySession: (token: string) => Promise<UserMe>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from a stored token on first mount.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await authApi.login(email, password);
    setToken(access_token);
    const me = await api.me();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { access_token } = await authApi.register(payload);
    setToken(access_token);
    const me = await api.me();
    setUser(me);
    return me;
  }, []);

  const applySession = useCallback(async (token: string) => {
    setToken(token);
    const me = await api.me();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // A 401 from any API call (expired/invalid token) signs the user out;
  // the route guards then redirect to /login.
  useEffect(() => {
    const onExpired = () => {
      clearToken();
      setUser(null);
    };
    window.addEventListener("pva:auth-expired", onExpired);
    return () => window.removeEventListener("pva:auth-expired", onExpired);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, applySession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

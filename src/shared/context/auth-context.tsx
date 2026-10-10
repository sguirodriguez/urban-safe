import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { login as loginRequest, register } from '@/shared/api/auth';
import { getMe } from '@/shared/api/users';
import { ApiError } from '@/shared/helpers/api-error';
import { TOKEN_STORAGE_KEY } from '@/shared/helpers/request';
import type { User } from '@/shared/types';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = 'alerta-user';

function persistSession(token: string, nextUser: User) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
}

function clearSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        localStorage.removeItem(USER_STORAGE_KEY);
        if (active) setLoading(false);
        return;
      }

      try {
        const me = await getMe();
        if (!active) return;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
        setUser(me);
      } catch (error) {
        if (!active) return;

        const unauthorized =
          error instanceof ApiError &&
          (error.statusCode === 401 || error.code === 'UNAUTHORIZED');

        if (unauthorized) {
          clearSession();
          setUser(null);
        } else {
          const stored = localStorage.getItem(USER_STORAGE_KEY);
          if (!stored) {
            setUser(null);
          } else {
            try {
              setUser(JSON.parse(stored) as User);
            } catch {
              clearSession();
              setUser(null);
            }
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(email: string, password: string) {
    const { token, user: nextUser } = await loginRequest({ email, password });
    persistSession(token, nextUser);
    setUser(nextUser);
  }

  async function signup(name: string, email: string, password: string) {
    const { token, user: nextUser } = await register({ name, email, password });
    persistSession(token, nextUser);
    setUser(nextUser);
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, signup, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

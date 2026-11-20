/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from '../services/authApi';

export interface AuthUser {
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  handleLogin: (email: string, password: string) => Promise<string | null>;
  handleRegisterSuccess: (account: {
    name: string;
    email: string;
    password: string;
  }) => Promise<string | null>;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('cloudwise_token'),
  );
  // Initialize loading based on whether token is present in storage
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(sessionStorage.getItem('cloudwise_token')),
  );

  // Check session on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('cloudwise_token');

    if (!savedToken) {
      return;
    }

    getCurrentUser(savedToken)
      .then((currentUser) => {
        const savedName =
          sessionStorage.getItem('cloudwise_user_name') ||
          currentUser.email.split('@')[0];
        setToken(savedToken);
        setUser({
          email: currentUser.email,
          name: savedName,
        });
      })
      .catch(() => {
        sessionStorage.removeItem('cloudwise_token');
        sessionStorage.removeItem('cloudwise_user_name');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleLogin = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const response = await loginUser(email.trim().toLowerCase(), password);

        // Verify current user with new token
        const currentUser = await getCurrentUser(response.token);

        sessionStorage.setItem('cloudwise_token', response.token);
        sessionStorage.setItem('cloudwise_user_name', response.name);

        setToken(response.token);
        setUser({
          email: currentUser.email,
          name: response.name,
        });

        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : 'Login failed. Please try again.';
      }
    },
    [],
  );

  const handleRegisterSuccess = useCallback(
    async (account: {
      name: string;
      email: string;
      password: string;
    }): Promise<string | null> => {
      try {
        await registerUser({
          name: account.name.trim(),
          email: account.email.trim().toLowerCase(),
          password: account.password,
        });

        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';
      }
    },
    [],
  );

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('cloudwise_token');
    sessionStorage.removeItem('cloudwise_user_name');

    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        handleLogin,
        handleRegisterSuccess,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

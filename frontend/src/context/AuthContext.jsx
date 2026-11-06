import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap session from /api/auth/me on initial mount
  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const userData = response.data || response;
        if (isMounted) {
          setUser(userData);
        }
      } catch {
        try {
          localStorage.removeItem('token');
        } catch {
          // Ignore storage error
        }
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to 401 unauthorized events from Axios
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      try {
        localStorage.removeItem('token');
      } catch {
        // Ignore storage error
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    const authData = response.data || response;
    const newToken = authData.token;
    const newUser = authData.user;

    try {
      localStorage.setItem('token', newToken);
    } catch {
      // Ignore storage error
    }

    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async ({ fullName, email, password }) => {
    const response = await api.post('/auth/register', { fullName, email, password });
    const authData = response.data || response;
    const newToken = authData.token;
    const newUser = authData.user;

    try {
      localStorage.setItem('token', newToken);
    } catch {
      // Ignore storage error
    }

    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('token');
    } catch {
      // Ignore storage error
    }
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      return null;
    }

    try {
      const response = await api.get('/auth/me');
      const userData = response.data || response;
      setUser(userData);
      return userData;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === 'ROLE_ADMIN',
      isStudent: user?.role === 'ROLE_STUDENT',
      isLoading,
      login,
      register,
      logout,
      refreshUser
    }),
    [user, token, isLoading, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

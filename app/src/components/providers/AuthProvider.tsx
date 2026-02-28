'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import type { AuthPayload, UserRole } from '../../../../shared/types';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  isAdmin: false,
  isSuperAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = Cookies.get('auth-token');
    const storedUser = localStorage.getItem('auth-user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored data
        Cookies.remove('auth-token');
        localStorage.removeItem('auth-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    Cookies.set('auth-token', newToken, { expires: 7, secure: true, sameSite: 'strict' });
    localStorage.setItem('auth-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    Cookies.remove('auth-token');
    localStorage.removeItem('auth-user');
    router.push('/en/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        token, 
        isLoading, 
        login, 
        logout, 
        isAdmin: user?.role === 'admin' || user?.role === 'super-admin',
        isSuperAdmin: user?.role === 'super-admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

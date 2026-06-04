import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';
import { supabase } from '../utils/supabase';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string, email: string, name: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          // Sync with our backend
          const idToken = session.access_token;
          const email = session.user.email || '';
          const name = session.user.user_metadata.full_name || session.user.user_metadata.name || email.split('@')[0];
          
          const data: any = await api.loginWithGoogle(idToken, email, name);
          localStorage.setItem('token', data.token);
          setUser(data.user);
        } catch (error) {
          console.error('Google sync failed:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const data: any = await api.getCurrentUser();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const data: any = await api.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }

  async function loginWithGoogle(idToken: string, email: string, name: string) {
    const data: any = await api.loginWithGoogle(idToken, email, name);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }

  async function register(email: string, password: string, name: string) {
    const data: any = await api.register(email, password, name);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

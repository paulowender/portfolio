'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(data);
      }

      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(data);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.time('signIn');
    console.log('Starting sign in process...');

    try {
      console.time('supabase.auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.timeEnd('supabase.auth.signInWithPassword');

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful, user:', data.user?.id);
      return { error: null };
    } catch (err) {
      console.error('Exception during sign in:', err);
      return { error: err };
    } finally {
      console.timeEnd('signIn');
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (authError) return { error: authError };

    // Create user profile
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const { error: profileError } = await supabase.from('users').insert({
        id: authUser.id,
        email,
        name,
        created_at: new Date().toISOString(),
      });

      if (profileError) return { error: profileError };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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

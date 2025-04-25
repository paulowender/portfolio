'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';
import { useUser, useSignIn, useSignUp, useSignOut } from '@/hooks/useAuthQuery';
import { useQueryClient } from '@tanstack/react-query';

export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  title?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  skills?: string[];
  avatarUrl?: string;
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
  const router = useRouter();
  const queryClient = useQueryClient();

  // Usar os hooks do React Query para autenticação
  const { data: user, isLoading } = useUser();
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const signOutMutation = useSignOut();

  // Configurar o listener de mudanças de autenticação
  useEffect(() => {
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('Auth state changed:', event);

      // Invalidar a consulta do usuário para forçar uma nova busca
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Implementar as funções de autenticação
  const signIn = async (email: string, password: string) => {
    try {
      await signInMutation.mutateAsync({ email, password });
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      await signUpMutation.mutateAsync({ email, password, name });
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await signOutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, signIn, signUp, signOut }}>
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

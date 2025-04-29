'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import {
  useUser,
  useSignIn,
  useSignUp,
  useSignOut,
  useResetPassword,
  useUpdatePassword,
} from '@/hooks/useAuthQuery';
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
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Usar os hooks do React Query para autenticação
  const { data: user, isLoading } = useUser();
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const signOutMutation = useSignOut();
  const resetPasswordMutation = useResetPassword();
  const updatePasswordMutation = useUpdatePassword();

  // Configurar o listener de mudanças de autenticação
  useEffect(() => {
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Não redirecionamos aqui, deixamos a página de reset-password lidar com isso
      }

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

  const resetPassword = async (email: string) => {
    try {
      await resetPasswordMutation.mutateAsync({ email });
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      await updatePasswordMutation.mutateAsync({ password });
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
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

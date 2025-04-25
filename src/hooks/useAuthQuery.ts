'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Chaves de consulta para React Query
export const authKeys = {
  user: ['auth', 'user'] as const,
  session: ['auth', 'session'] as const,
};

// Hook para obter o usuário atual
export function useUser() {
  const router = useRouter();

  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      try {
        // Primeiro, verifique se temos uma sessão
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          return null;
        }
        
        // Se tivermos uma sessão, busque os dados do usuário
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user data:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error('Exception in useUser:', err);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
}

// Hook para login
export function useSignIn() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.time('signIn');
      console.log('Starting sign in process...');

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log('Sign in successful, user:', data.user?.id);
      console.timeEnd('signIn');
      
      return data;
    },
    onSuccess: async (data) => {
      // Invalidar a consulta do usuário para forçar uma nova busca
      await queryClient.invalidateQueries({ queryKey: authKeys.user });
      await queryClient.invalidateQueries({ queryKey: authKeys.session });
      
      // Redirecionar para o dashboard
      router.push('/dashboard');
    },
  });
}

// Hook para registro
export function useSignUp() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      // Registrar o usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      
      if (authError) throw authError;
      
      // Criar perfil do usuário
      if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          name,
          created_at: new Date().toISOString(),
        });
        
        if (profileError) throw profileError;
      }
      
      return authData;
    },
    onSuccess: async (data) => {
      // Invalidar a consulta do usuário para forçar uma nova busca
      await queryClient.invalidateQueries({ queryKey: authKeys.user });
      await queryClient.invalidateQueries({ queryKey: authKeys.session });
      
      // Redirecionar para o dashboard
      router.push('/dashboard');
    },
  });
}

// Hook para logout
export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      // Limpar o cache do usuário
      queryClient.setQueryData(authKeys.user, null);
      queryClient.setQueryData(authKeys.session, null);
      
      // Redirecionar para a página inicial
      router.push('/');
    },
  });
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Chaves de consulta para React Query
export const authKeys = {
  user: ['auth', 'user'] as const,
  session: ['auth', 'session'] as const,
  resetPassword: ['auth', 'resetPassword'] as const,
  updatePassword: ['auth', 'updatePassword'] as const,
};

// Hook para obter o usuário atual
export function useUser() {
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
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
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => {
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
    onSuccess: async () => {
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

// Hook para solicitar redefinição de senha
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para atualizar a senha do usuário
export function useUpdatePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      // Verificar se temos uma sessão
      await supabase.auth.getSession();

      // Atualizar a senha
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
      // Invalidar a consulta do usuário para forçar uma nova busca
      await queryClient.invalidateQueries({ queryKey: authKeys.user });
      await queryClient.invalidateQueries({ queryKey: authKeys.session });

      // Não redirecionamos aqui, deixamos a página de reset-password lidar com isso
      // para que o usuário veja a mensagem de sucesso
    },
  });
}

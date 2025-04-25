'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIProvider, UserAIConfig } from '@/types/ai';
import axiosClient from '@/lib/axios-client';

// Chaves de consulta para React Query
export const aiConfigKeys = {
  all: ['ai', 'config'] as const,
  user: (userId?: string) => [...aiConfigKeys.all, 'user', userId] as const,
};

// Hook para buscar a configuração de IA do usuário
export function useAIConfig(userId?: string) {
  return useQuery({
    queryKey: aiConfigKeys.user(userId),
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        const response = await axiosClient.get(`/api/ai/config/${userId}`);
        return response.data.config;
      } catch (error: any) {
        console.error('Error fetching AI config:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch AI configuration');
      }
    },
    enabled: !!userId,
  });
}

// Hook para atualizar a configuração de provedor de IA
export function useUpdateAIProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      provider, 
      apiKey, 
      isEnabled 
    }: { 
      userId: string; 
      provider: AIProvider; 
      apiKey: string; 
      isEnabled: boolean;
    }) => {
      try {
        const response = await axiosClient.post(`/api/ai/config/${userId}/provider`, {
          provider,
          apiKey,
          isEnabled,
        });
        
        return response.data;
      } catch (error: any) {
        console.error('Error updating AI provider:', error);
        throw new Error(error.response?.data?.error || 'Failed to update AI provider');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidar a consulta da configuração de IA
      queryClient.invalidateQueries({ 
        queryKey: aiConfigKeys.user(variables.userId) 
      });
    },
  });
}

// Hook para atualizar o modelo de IA selecionado
export function useUpdateAIModel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      provider, 
      modelId 
    }: { 
      userId: string; 
      provider: AIProvider; 
      modelId: string;
    }) => {
      try {
        const response = await axiosClient.post(`/api/ai/config/${userId}/model`, {
          provider,
          modelId,
        });
        
        return response.data;
      } catch (error: any) {
        console.error('Error updating AI model:', error);
        throw new Error(error.response?.data?.error || 'Failed to update AI model');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidar a consulta da configuração de IA
      queryClient.invalidateQueries({ 
        queryKey: aiConfigKeys.user(variables.userId) 
      });
    },
  });
}

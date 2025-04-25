'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import axiosClient from '@/lib/axios-client';

// Chaves de consulta para React Query
export const portfolioKeys = {
  all: ['portfolio'] as const,
  projects: (userId?: string) => [...portfolioKeys.all, 'projects', userId] as const,
  project: (id: string) => [...portfolioKeys.all, 'project', id] as const,
  profile: (userId: string) => [...portfolioKeys.all, 'profile', userId] as const,
  company: (userId: string) => [...portfolioKeys.all, 'company', userId] as const,
  portfolioData: ['portfolioData'] as const,
};

// Hook para buscar projetos
export function useProjects(userId?: string) {
  return useQuery({
    queryKey: portfolioKeys.projects(userId),
    queryFn: async () => {
      console.log('Fetching projects for user:', userId);

      const url = userId ? `/api/projects?userId=${userId}` : '/api/projects';
      console.log('Fetching from URL:', url);

      try {
        // O Axios interceptor vai adicionar automaticamente o token de autenticação
        const response = await axiosClient.get(url);

        console.log(
          'Projects fetched successfully:',
          response.data.projects?.length || 0,
          'projects',
        );
        return response.data.projects;
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch projects');
      }
    },
    staleTime: 60 * 1000, // 1 minuto
  });
}

// Hook para buscar um projeto específico
export function useProject(id: string) {
  return useQuery({
    queryKey: portfolioKeys.project(id),
    queryFn: async () => {
      console.log(`Fetching project with ID: ${id}`);

      try {
        // O Axios interceptor vai adicionar automaticamente o token de autenticação
        const response = await axiosClient.get(`/api/projects/${id}`);

        console.log('Project fetched successfully:', response.data.project?.id);
        return response.data.project;
      } catch (error: any) {
        console.error('Error fetching project:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch project');
      }
    },
    staleTime: 60 * 1000, // 1 minuto
  });
}

// Hook para criar um projeto
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: any) => {
      try {
        // O Axios interceptor vai adicionar automaticamente o token de autenticação
        const response = await axiosClient.post('/api/projects/create', projectData);

        console.log('Project created successfully:', response.data.project?.id);
        return response.data.project;
      } catch (error: any) {
        console.error('Error creating project:', error);
        throw new Error(error.response?.data?.error || 'Failed to create project');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidar a consulta de projetos para forçar uma nova busca
      if (variables.user && variables.user.connect && variables.user.connect.id) {
        queryClient.invalidateQueries({
          queryKey: portfolioKeys.projects(variables.user.connect.id),
        });
      }

      // Invalidar dados do portfólio se o projeto for destaque
      if (variables.featured) {
        queryClient.invalidateQueries({
          queryKey: portfolioKeys.portfolioData,
        });
      }
    },
  });
}

// Hook para atualizar um projeto
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectData }: { id: string; projectData: any }) => {
      // Get the session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      const data = await response.json();
      return data.project;
    },
    onSuccess: (data) => {
      // Invalidar a consulta do projeto específico
      queryClient.invalidateQueries({ queryKey: portfolioKeys.project(data.id) });

      // Invalidar a consulta de projetos para forçar uma nova busca
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: portfolioKeys.projects(data.userId) });
      }

      // Invalidar dados do portfólio se o projeto for destaque
      if (data.featured) {
        queryClient.invalidateQueries({ queryKey: portfolioKeys.portfolioData });
      }
    },
  });
}

// Hook para excluir um projeto
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Primeiro, obtenha o projeto para saber qual usuário invalidar
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Obter o projeto antes de excluí-lo
      const projectResponse = await fetch(`/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!projectResponse.ok) {
        const errorData = await projectResponse.json();
        throw new Error(errorData.error || 'Failed to fetch project');
      }

      const projectData = await projectResponse.json();
      const userId = projectData.project?.userId;
      const featured = projectData.project?.featured;

      // Excluir o projeto
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      return { userId, featured };
    },
    onSuccess: (data) => {
      // Invalidar a consulta de projetos para forçar uma nova busca
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: portfolioKeys.projects(data.userId) });
      }

      // Invalidar dados do portfólio se o projeto for destaque
      if (data.featured) {
        queryClient.invalidateQueries({ queryKey: portfolioKeys.portfolioData });
      }
    },
  });
}

// Hook para buscar o perfil do usuário
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: portfolioKeys.profile(userId),
    queryFn: async () => {
      console.log(`Fetching user profile with ID: ${userId}`);

      // Get the session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`/api/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch user profile');
      }

      const data = await response.json();
      console.log('User profile fetched successfully:', data.profile?.id);

      return data.profile;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para atualizar o perfil do usuário
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, profileData }: { userId: string; profileData: any }) => {
      // Get the session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user profile');
      }

      const data = await response.json();
      return data.profile;
    },
    onSuccess: (data) => {
      // Invalidar a consulta do perfil do usuário
      queryClient.invalidateQueries({ queryKey: portfolioKeys.profile(data.id) });

      // Invalidar dados do portfólio
      queryClient.invalidateQueries({ queryKey: portfolioKeys.portfolioData });

      // Atualizar os dados do usuário no cache
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
}

// Hook para buscar o perfil da empresa
export function useCompanyProfile(userId: string) {
  return useQuery({
    queryKey: portfolioKeys.company(userId),
    queryFn: async () => {
      console.log(`Fetching company profile for user: ${userId}`);

      // Get the session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`/api/company/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Se a empresa não existir, retorne null em vez de lançar um erro
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch company profile');
      }

      const data = await response.json();
      console.log('Company profile fetched successfully:', data.company?.id);

      return data.company;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para atualizar o perfil da empresa
export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, companyData }: { userId: string; companyData: any }) => {
      // Get the session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`/api/company/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company profile');
      }

      const data = await response.json();
      return data.company;
    },
    onSuccess: (data) => {
      // Invalidar a consulta do perfil da empresa
      queryClient.invalidateQueries({ queryKey: portfolioKeys.company(data.userId) });

      // Invalidar dados do portfólio
      queryClient.invalidateQueries({ queryKey: portfolioKeys.portfolioData });
    },
  });
}

// Hook para buscar os dados do portfólio para a página inicial
export function usePortfolioData() {
  return useQuery({
    queryKey: portfolioKeys.portfolioData,
    queryFn: async () => {
      try {
        // Não precisamos de autenticação para esta rota, mas o Axios vai lidar com isso
        const response = await axiosClient.get('/api/portfolio-data');

        console.log('Portfolio data fetched successfully');
        return response.data;
      } catch (error: any) {
        console.error('Error fetching portfolio data:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch portfolio data');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Importar as chaves de autenticação
import { authKeys } from './useAuthQuery';

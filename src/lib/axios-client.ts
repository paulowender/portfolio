import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { supabase } from './supabase';

// Criar uma instância do Axios
const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
axiosClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      // Obter a sessão atual
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      // Se tivermos um token, adicionar ao cabeçalho
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      return config;
    } catch (error) {
      console.error('Error in axios request interceptor:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Verificar se o erro é de autenticação (401)
    if (error.response?.status === 401) {
      // Tentar atualizar a sessão
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        // Se não conseguir atualizar, redirecionar para login
        console.error('Session refresh failed:', refreshError);
        
        // Se estivermos no navegador, redirecionar para login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
      
      // Se conseguir atualizar, tentar a requisição novamente
      if (refreshData.session && error.config) {
        // Atualizar o token na requisição
        error.config.headers = {
          ...error.config.headers,
          Authorization: `Bearer ${refreshData.session.access_token}`,
        };
        
        // Repetir a requisição com o novo token
        return axiosClient(error.config);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;

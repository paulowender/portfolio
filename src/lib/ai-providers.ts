import { AIProvider } from '@/types/ai';
import axiosClient from './axios-client';

export interface AIProviderConfig {
  provider: AIProvider;
  isEnabled: boolean;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export async function fetchEnabledAIProviders(): Promise<AIProviderConfig[]> {
  try {
    const response = await axiosClient.get('/api/ai/providers');
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch AI providers');
    }
    
    const { providers } = response.data;
    
    // Filter only enabled providers
    return providers.filter((provider: AIProviderConfig) => provider.isEnabled);
  } catch (error) {
    console.error('Error fetching AI providers:', error);
    return [];
  }
}

export async function improveBioWithAI(
  bio: string,
  title: string,
  skills: string[],
  provider: AIProvider
): Promise<string> {
  try {
    const response = await axiosClient.post('/api/profile/improve-bio', {
      bio,
      title,
      skills,
      provider
    });
    
    if (response.status !== 200) {
      throw new Error('Failed to improve bio');
    }
    
    return response.data.improvedBio;
  } catch (error) {
    console.error('Error improving bio:', error);
    throw error;
  }
}

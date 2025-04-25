'use client';

import { useState } from 'react';
import { AIMessage, AICompletionResponse } from '@/types/ai';
import { useAIConfig } from './useAIConfig';
import axiosClient from '@/lib/axios-client';

interface UseAIOptions {
  userId: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export function useAI({
  userId,
  provider,
  model,
  temperature = 0.7,
  maxTokens = 1000,
}: UseAIOptions) {
  const { data: aiConfig } = useAIConfig(userId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the active provider and model
  const getActiveProvider = () => {
    if (provider) return provider;
    return aiConfig?.defaultProvider || 'openai';
  };

  const getActiveModel = (activeProvider: string) => {
    if (model) return model;

    // Get provider-specific model if available
    const providerKey = activeProvider as keyof typeof aiConfig.providers;
    const providerConfig = aiConfig?.providers[providerKey];

    if (providerConfig?.defaultModel) {
      return providerConfig.defaultModel;
    }

    // Fall back to default model
    return aiConfig?.defaultModel || 'gpt-3.5-turbo';
  };

  // Check if AI is configured
  const isConfigured = () => {
    if (!aiConfig) return false;

    const activeProvider = getActiveProvider();
    const providerKey = activeProvider as keyof typeof aiConfig.providers;
    const providerConfig = aiConfig.providers[providerKey];

    return !!providerConfig?.apiKey && providerConfig.isEnabled;
  };

  // Send a completion request
  const complete = async (messages: AIMessage[]): Promise<AICompletionResponse | null> => {
    if (!isConfigured()) {
      setError('AI is not configured. Please set up your AI provider in the integrations page.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const activeProvider = getActiveProvider();
      const activeModel = getActiveModel(activeProvider);

      const response = await axiosClient.post('/api/ai/complete', {
        provider: activeProvider,
        model: activeModel,
        messages,
        temperature,
        maxTokens,
      });

      return response.data;
    } catch (err: any) {
      console.error('Error completing AI request:', err);
      setError(err.response?.data?.error || 'Failed to complete AI request');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    complete,
    isLoading,
    error,
    isConfigured: isConfigured(),
    activeProvider: getActiveProvider(),
    activeModel: getActiveModel(getActiveProvider()),
  };
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { AI_PROVIDERS, AIModel, AIProvider, AIProviderConfig } from '@/types/ai';
import AIProviderCard from '@/components/ai/AIProviderCard';
import ModelSelector from '@/components/ai/ModelSelector';
import { motion } from 'framer-motion';

export default function AIIntegrationsPage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<AIProviderConfig[]>(AI_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/ai/config/${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Update providers with saved configuration
          const updatedProviders = [...providers];
          
          updatedProviders.forEach(provider => {
            const providerKey = provider.provider as keyof typeof data.config.providers;
            const providerConfig = data.config.providers[providerKey];
            
            if (providerConfig) {
              provider.apiKey = providerConfig.apiKey || '';
              provider.isEnabled = providerConfig.isEnabled || false;
              
              // Set default model if available
              if (providerConfig.defaultModel) {
                provider.models.forEach(model => {
                  if (model.id === providerConfig.defaultModel) {
                    model.isRecommended = true;
                  }
                });
              }
            }
          });
          
          setProviders(updatedProviders);
        }
      } catch (err) {
        console.error('Error fetching AI configuration:', err);
        setError('Failed to load AI configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [user]);

  const handleSaveProvider = async (provider: string, apiKey: string, isEnabled: boolean) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/ai/config/${user.id}/provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          apiKey,
          isEnabled,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save provider configuration');
      }

      // Update local state
      const updatedProviders = providers.map(p => {
        if (p.provider === provider) {
          return {
            ...p,
            apiKey,
            isEnabled,
          };
        }
        return p;
      });

      setProviders(updatedProviders);
    } catch (err: any) {
      console.error('Error saving provider configuration:', err);
      throw err;
    }
  };

  const handleSelectModel = async (modelId: string) => {
    if (!user || !selectedProvider) return;

    try {
      const response = await fetch(`/api/ai/config/${user.id}/model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          modelId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to select model');
      }

      // Update local state
      const updatedProviders = providers.map(p => {
        if (p.provider === selectedProvider) {
          const updatedModels = p.models.map(model => ({
            ...model,
            isRecommended: model.id === modelId,
          }));

          return {
            ...p,
            models: updatedModels,
          };
        }
        return p;
      });

      setProviders(updatedProviders);
    } catch (err: any) {
      console.error('Error selecting model:', err);
      throw err;
    }
  };

  const getModelsForProvider = (provider: AIProvider): AIModel[] => {
    const providerConfig = providers.find(p => p.provider === provider);
    return providerConfig ? providerConfig.models : [];
  };

  const getSelectedModelForProvider = (provider: AIProvider): string | undefined => {
    const providerConfig = providers.find(p => p.provider === provider);
    if (!providerConfig) return undefined;
    
    const recommendedModel = providerConfig.models.find(model => model.isRecommended);
    return recommendedModel?.id;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">AI Integrations</h1>
        <p className="text-gray-400 mb-8">
          Connect your AI providers to use AI features throughout the application.
        </p>

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <AIProviderCard
              key={provider.provider}
              provider={provider}
              onSave={handleSaveProvider}
              onSelectModel={(provider) => setSelectedProvider(provider as AIProvider)}
            />
          ))}
        </div>
      </motion.div>

      {selectedProvider && (
        <ModelSelector
          provider={selectedProvider}
          models={getModelsForProvider(selectedProvider)}
          selectedModel={getSelectedModelForProvider(selectedProvider)}
          onSelect={handleSelectModel}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}

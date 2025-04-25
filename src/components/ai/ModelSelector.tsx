'use client';

import { useState } from 'react';
import { AIModel, AIProvider } from '@/types/ai';
import Button from '@/components/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModelSelectorProps {
  provider: AIProvider;
  models: AIModel[];
  selectedModel?: string;
  onSelect: (modelId: string) => Promise<void>;
  onClose: () => void;
}

export default function ModelSelector({
  provider,
  models,
  selectedModel,
  onSelect,
  onClose,
}: ModelSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(selectedModel || '');

  const handleSelect = async () => {
    if (!selected) {
      setError('Please select a model');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSelect(selected);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to select model');
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderName = () => {
    switch (provider) {
      case 'openai':
        return 'OpenAI';
      case 'anthropic':
        return 'Anthropic';
      case 'groq':
        return 'Groq';
      case 'openrouter':
        return 'OpenRouter';
      default:
        return 'AI Provider';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Select {getProviderName()} Model</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {models.map((model) => (
            <div
              key={model.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selected === model.id
                  ? 'border-indigo-500 bg-indigo-900 bg-opacity-20'
                  : 'border-gray-700 hover:border-indigo-400'
              }`}
              onClick={() => setSelected(model.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <h3 className="font-medium text-lg">{model.name}</h3>
                  <div className="flex ml-3 space-x-2">
                    {model.isRecommended && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300 border border-green-700">
                        Recommended
                      </span>
                    )}
                    {model.isFree && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-300 border border-blue-700">
                        Free
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {model.tier === 'free' && 'Free'}
                  {model.tier === 'basic' && 'Basic'}
                  {model.tier === 'standard' && 'Standard'}
                  {model.tier === 'premium' && 'Premium'}
                  {model.tier === 'enterprise' && 'Enterprise'}
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">{model.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                {model.contextWindow && (
                  <span className="px-2 py-1 rounded-full bg-gray-700">
                    Context: {model.contextWindow.toLocaleString()} tokens
                  </span>
                )}
                {model.maxTokens && (
                  <span className="px-2 py-1 rounded-full bg-gray-700">
                    Max output: {model.maxTokens.toLocaleString()} tokens
                  </span>
                )}
                {model.costPer1kTokensInput && (
                  <span className="px-2 py-1 rounded-full bg-gray-700">
                    Input: ${model.costPer1kTokensInput}/1k tokens
                  </span>
                )}
                {model.costPer1kTokensOutput && (
                  <span className="px-2 py-1 rounded-full bg-gray-700">
                    Output: ${model.costPer1kTokensOutput}/1k tokens
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} isLoading={isLoading} disabled={!selected}>
            Select Model
          </Button>
        </div>
      </div>
    </div>
  );
}

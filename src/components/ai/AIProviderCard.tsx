'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AIProviderConfig } from '@/types/ai';
import Button from '@/components/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface AIProviderCardProps {
  provider: AIProviderConfig;
  onSave: (provider: string, apiKey: string, isEnabled: boolean) => Promise<void>;
  onSelectModel: (provider: string) => void;
}

export default function AIProviderCard({ provider, onSave, onSelectModel }: AIProviderCardProps) {
  const [apiKey, setApiKey] = useState(provider.apiKey || '');
  const [isEnabled, setIsEnabled] = useState(provider.isEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!apiKey) {
      setError('API Key is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(provider.provider, apiKey, isEnabled);
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative">
            <Image
              src={provider.logoUrl}
              alt={`${provider.name} logo`}
              width={40}
              height={40}
              className="rounded-md"
            />
          </div>
          <h3 className="text-xl font-semibold">{provider.name}</h3>
        </div>
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabled}
              onChange={() => setIsEnabled(!isEnabled)}
              disabled={!apiKey}
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-300">
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
      </div>

      <p className="text-gray-400 mb-4 text-sm">{provider.description}</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={`Enter your ${provider.name} API key`}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showApiKey ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleSave}
          isLoading={isLoading}
          disabled={!apiKey}
          className="flex-1"
        >
          Save
        </Button>
        <Button
          variant="outline"
          onClick={() => onSelectModel(provider.provider)}
          disabled={!isEnabled || !apiKey}
          className="flex-1"
        >
          Select Model
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { EvolutionInstance } from '@/types/messaging';
import Button from '@/components/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface EvolutionProviderCardProps {
  apiKey: string;
  baseUrl: string;
  isEnabled: boolean;
  onSave: (apiKey: string, baseUrl: string, isEnabled: boolean) => Promise<void>;
  onManageInstances: () => void;
  onTestConnection: (apiKey: string, baseUrl: string) => Promise<void>;
}

export default function EvolutionProviderCard({
  apiKey,
  baseUrl,
  isEnabled,
  onSave,
  onManageInstances,
  onTestConnection,
}: EvolutionProviderCardProps) {
  const [apiKeyValue, setApiKeyValue] = useState(apiKey || '');
  const [baseUrlValue, setBaseUrlValue] = useState(baseUrl || 'https://');
  const [isEnabledValue, setIsEnabledValue] = useState(isEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    if (!apiKeyValue) {
      setError('API Key is required');
      return;
    }

    if (!baseUrlValue || !baseUrlValue.startsWith('http')) {
      setError('Base URL is required and must be a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(apiKeyValue, baseUrlValue, isEnabledValue);
      setTestStatus('idle');
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKeyValue) {
      setError('API Key is required');
      return;
    }

    if (!baseUrlValue || !baseUrlValue.startsWith('http')) {
      setError('Base URL is required and must be a valid URL');
      return;
    }

    setIsTesting(true);
    setError('');

    try {
      await onTestConnection(apiKeyValue, baseUrlValue);
      setTestStatus('success');
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Evolution API');
      setTestStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative">
            <Image
              src="/images/ai/evolution-logo.svg"
              alt="Evolution API logo"
              width={40}
              height={40}
              className="rounded-md"
            />
          </div>
          <h3 className="text-xl font-semibold">Evolution API</h3>
        </div>
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabledValue}
              onChange={() => setIsEnabledValue(!isEnabledValue)}
              disabled={!apiKeyValue || !baseUrlValue}
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-300">
              {isEnabledValue ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
      </div>

      <p className="text-gray-400 mb-4 text-sm">
        Integração com a Evolution API v2 para automação de WhatsApp e comunicação com clientes.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKeyValue}
            onChange={(e) => setApiKeyValue(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your Evolution API key"
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
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Base URL</label>
        <input
          type="text"
          value={baseUrlValue}
          onChange={(e) => setBaseUrlValue(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="https://your-evolution-api.com"
        />
        <p className="mt-1 text-xs text-gray-400">
          URL completa da sua instância da Evolution API, ex: https://api.example.com
        </p>
      </div>

      {error && <p className="mt-1 text-sm text-red-500 mb-4">{error}</p>}

      {testStatus === 'success' && (
        <div className="mb-4 p-2 bg-green-900 bg-opacity-20 border border-green-700 rounded-md text-green-300 text-sm">
          Conexão com a Evolution API estabelecida com sucesso!
        </div>
      )}

      <div className="flex flex-col space-y-3">
        <div className="flex space-x-3">
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            disabled={!apiKeyValue || !baseUrlValue}
            className="flex-1"
          >
            Save
          </Button>
          <Button
            variant="outline"
            onClick={handleTestConnection}
            isLoading={isTesting}
            disabled={!apiKeyValue || !baseUrlValue}
            className="flex-1"
          >
            Test Connection
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={onManageInstances}
          disabled={!isEnabledValue || !apiKeyValue || !baseUrlValue}
        >
          Manage WhatsApp Instances
        </Button>
      </div>
    </div>
  );
}

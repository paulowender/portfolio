'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ResendProviderCardProps {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  isEnabled: boolean;
  onSave: (apiKey: string, fromEmail: string, fromName: string, isEnabled: boolean) => Promise<void>;
  onTestEmail: (apiKey: string, fromEmail: string, fromName: string, toEmail: string) => Promise<void>;
}

export default function ResendProviderCard({
  apiKey,
  fromEmail,
  fromName,
  isEnabled,
  onSave,
  onTestEmail,
}: ResendProviderCardProps) {
  const [apiKeyValue, setApiKeyValue] = useState(apiKey || '');
  const [fromEmailValue, setFromEmailValue] = useState(fromEmail || '');
  const [fromNameValue, setFromNameValue] = useState(fromName || '');
  const [toEmailValue, setToEmailValue] = useState('');
  const [isEnabledValue, setIsEnabledValue] = useState(isEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showTestForm, setShowTestForm] = useState(false);

  const handleSave = async () => {
    if (!apiKeyValue) {
      setError('API Key is required');
      return;
    }

    if (!fromEmailValue) {
      setError('From Email is required');
      return;
    }

    if (!fromNameValue) {
      setError('From Name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(apiKeyValue, fromEmailValue, fromNameValue, isEnabledValue);
      setTestStatus('idle');
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!apiKeyValue) {
      setError('API Key is required');
      return;
    }

    if (!fromEmailValue) {
      setError('From Email is required');
      return;
    }

    if (!fromNameValue) {
      setError('From Name is required');
      return;
    }

    if (!toEmailValue) {
      setError('To Email is required');
      return;
    }

    setIsTesting(true);
    setError('');

    try {
      await onTestEmail(apiKeyValue, fromEmailValue, fromNameValue, toEmailValue);
      setTestStatus('success');
    } catch (err: any) {
      setError(err.message || 'Failed to send test email');
      setTestStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative">
            <Image
              src="/images/messaging/resend-logo.svg"
              alt="Resend logo"
              width={40}
              height={40}
              className="rounded-md"
            />
          </div>
          <h3 className="text-xl font-semibold">Resend</h3>
        </div>
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabledValue}
              onChange={() => setIsEnabledValue(!isEnabledValue)}
              disabled={!apiKeyValue || !fromEmailValue || !fromNameValue}
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-300">
              {isEnabledValue ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
      </div>

      <p className="text-gray-400 mb-4 text-sm">
        Plataforma moderna de envio de emails para desenvolvedores, com alta entregabilidade e análises detalhadas.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKeyValue}
            onChange={(e) => setApiKeyValue(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="re_1234567890abcdefghijklmnopqrstuvwxyz"
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
        <label className="block text-sm font-medium text-gray-300 mb-1">From Email</label>
        <input
          type="email"
          value={fromEmailValue}
          onChange={(e) => setFromEmailValue(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="noreply@yourdomain.com"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">From Name</label>
        <input
          type="text"
          value={fromNameValue}
          onChange={(e) => setFromNameValue(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your Company Name"
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500 mb-4">{error}</p>}

      {testStatus === 'success' && (
        <div className="mb-4 p-2 bg-green-900 bg-opacity-20 border border-green-700 rounded-md text-green-300 text-sm">
          Email de teste enviado com sucesso!
        </div>
      )}

      {showTestForm && (
        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">Enviar Email de Teste</h4>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-300 mb-1">Para (Email)</label>
            <input
              type="email"
              value={toEmailValue}
              onChange={(e) => setToEmailValue(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="seu@email.com"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleTestEmail}
              isLoading={isTesting}
              disabled={!toEmailValue}
            >
              Enviar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowTestForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          onClick={handleSave}
          isLoading={isLoading}
          disabled={!apiKeyValue || !fromEmailValue || !fromNameValue}
          className="flex-1"
        >
          Save
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowTestForm(true)}
          disabled={!apiKeyValue || !fromEmailValue || !fromNameValue}
          className="flex-1"
        >
          Test Email
        </Button>
      </div>
    </div>
  );
}

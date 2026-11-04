'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AIProviderConfig } from '@/types/ai';
import Button from '@/components/Button';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useTranslations } from 'next-intl';

interface AIProviderCardProps {
  provider: AIProviderConfig;
  onSave: (provider: string, apiKey: string, isEnabled: boolean) => Promise<void>;
  onSelectModel: (provider: string) => void;
}

export default function AIProviderCard({ provider, onSave, onSelectModel }: AIProviderCardProps) {
  const t = useTranslations('aiIntegrationsPage');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative size-11 overflow-hidden rounded-xl border border-border bg-secondary p-1.5">
            <Image
              src={provider.logoUrl}
              alt={`${provider.name} logo`}
              width={40}
              height={40}
              className="h-full w-full rounded-lg object-contain"
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{provider.name}</h3>
            <StatusBadge tone={isEnabled ? 'success' : apiKey ? 'neutral' : 'warning'}>
              {isEnabled ? t('active') : apiKey ? t('disabled') : t('unconfigured')}
            </StatusBadge>
          </div>
        </div>
        <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm font-medium text-muted-foreground">
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} disabled={!apiKey} aria-label={`${t('enable')} ${provider.name}`} />
          {isEnabled ? t('active') : t('inactive')}
        </label>
      </div>

      <p className="mb-5 text-sm leading-6 text-muted-foreground">{provider.description}</p>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium text-foreground">API Key</label>
        <div className="relative">
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="pr-12"
            placeholder={`Enter your ${provider.name} API key`}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={showApiKey ? t('hideKey') : t('showKey')}
          >
            {showApiKey ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleSave}
          isLoading={isLoading}
          disabled={!apiKey}
          className="flex-1"
        >
          {t('save')}
        </Button>
        <Button
          variant="outline"
          onClick={() => onSelectModel(provider.provider)}
          disabled={!isEnabled || !apiKey}
          className="flex-1"
        >
          {t('selectModel')}
        </Button>
      </div>
    </article>
  );
}

'use client';

import { useRef, useState } from 'react';
import { AIModel, AIProvider } from '@/types/ai';
import Button from '@/components/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/dashboard/StatusBadge';

interface ModelSelectorProps {
  provider: AIProvider;
  models: AIModel[];
  selectedModel?: string;
  onSelect: (modelId: string) => Promise<void>;
  onClose: () => void;
}

export default function ModelSelector({ provider, models, selectedModel, onSelect, onClose }: ModelSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(selectedModel || '');
  const openerRef = useRef<HTMLElement | null>(typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null);
  const providerName = provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : provider === 'groq' ? 'Groq' : provider === 'openrouter' ? 'OpenRouter' : 'AI Provider';

  const handleSelect = async () => {
    if (!selected) { setError('Please select a model'); return; }
    setIsLoading(true);
    setError('');
    try {
      await onSelect(selected);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to select model');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[84vh] overflow-y-auto sm:max-w-2xl" onCloseAutoFocus={(event) => { event.preventDefault(); openerRef.current?.focus(); }}>
        <div>
          <DialogTitle>Select {providerName} model</DialogTitle>
          <DialogDescription className="mt-2">Choose the model used by this provider.</DialogDescription>
        </div>

        <div role="radiogroup" aria-label={`${providerName} models`} className="space-y-3">
          {models.map((model) => (
            <button
              key={model.id}
              type="button"
              role="radio"
              aria-checked={selected === model.id}
              onClick={() => setSelected(model.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected === model.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-border-strong'}`}
            >
              <span className="flex flex-wrap items-start justify-between gap-3">
                <span>
                  <span className="flex flex-wrap items-center gap-2"><span className="font-semibold text-foreground">{model.name}</span>{model.isRecommended ? <StatusBadge tone="success">Recommended</StatusBadge> : null}{model.isFree ? <StatusBadge tone="info">Free</StatusBadge> : null}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{model.description}</span>
                </span>
                <span className="text-xs text-muted-foreground">{model.tier}</span>
              </span>
              <span className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {model.contextWindow ? <span className="rounded-full bg-secondary px-2 py-1">Context: {model.contextWindow.toLocaleString()} tokens</span> : null}
                {model.maxTokens ? <span className="rounded-full bg-secondary px-2 py-1">Max output: {model.maxTokens.toLocaleString()} tokens</span> : null}
                {model.costPer1kTokensInput ? <span className="rounded-full bg-secondary px-2 py-1">Input: ${model.costPer1kTokensInput}/1k</span> : null}
                {model.costPer1kTokensOutput ? <span className="rounded-full bg-secondary px-2 py-1">Output: ${model.costPer1kTokensOutput}/1k</span> : null}
              </span>
            </button>
          ))}
        </div>

        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSelect} isLoading={isLoading} disabled={!selected}>Select model</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

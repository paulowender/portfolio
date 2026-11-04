'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import ResendProviderCard from '@/components/messaging/ResendProviderCard';
import axiosClient from '@/lib/axios-client';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/dashboard/PageHeader';

export default function ResendIntegrationPage() {
  const t = useTranslations('resendPage');
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;

      try {
        const response = await axiosClient.get('/api/resend/config');

        if (response.status === 200) {
          const { config } = response.data;
          setApiKey(config.apiKey || '');
          setFromEmail(config.fromEmail || '');
          setFromName(config.fromName || '');
          setIsEnabled(config.isEnabled || false);
        }
      } catch (err) {
        console.error('Error fetching Resend configuration:', err);
        setError(t('failedToLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [user]);

  const handleSaveConfig = async (apiKey: string, fromEmail: string, fromName: string, isEnabled: boolean) => {
    if (!user) return;

    try {
      const response = await axiosClient.post('/api/resend/config', {
        apiKey,
        fromEmail,
        fromName,
        isEnabled,
      });

      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to save configuration');
      }

      setApiKey(apiKey);
      setFromEmail(fromEmail);
      setFromName(fromName);
      setIsEnabled(isEnabled);
    } catch (err: any) {
      console.error('Error saving Resend configuration:', err);
      throw err;
    }
  };

  const handleTestEmail = async (apiKey: string, fromEmail: string, fromName: string, toEmail: string) => {
    if (!user) return;

    try {
      const response = await axiosClient.post('/api/resend/test', {
        apiKey,
        fromEmail,
        fromName,
        toEmail,
      });

      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to send test email');
      }
    } catch (err: any) {
      console.error('Error sending test email:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t('title')} description={t('description')} backHref="/dashboard/integrations" backLabel={t('back')} />

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="max-w-3xl">
          <ResendProviderCard
            apiKey={apiKey}
            fromEmail={fromEmail}
            fromName={fromName}
            isEnabled={isEnabled}
            onSave={handleSaveConfig}
            onTestEmail={handleTestEmail}
          />
        </div>
    </div>
  );
}

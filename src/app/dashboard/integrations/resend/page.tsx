'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import ResendProviderCard from '@/components/messaging/ResendProviderCard';
import { motion } from 'framer-motion';
import axiosClient from '@/lib/axios-client';

export default function ResendIntegrationPage() {
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
        setError('Failed to load Resend configuration');
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
        <h1 className="text-3xl font-bold mb-2">Email Integration with Resend</h1>
        <p className="text-gray-400 mb-8">
          Connect to Resend for sending transactional emails with high deliverability.
        </p>

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          <ResendProviderCard
            apiKey={apiKey}
            fromEmail={fromEmail}
            fromName={fromName}
            isEnabled={isEnabled}
            onSave={handleSaveConfig}
            onTestEmail={handleTestEmail}
          />
        </div>
      </motion.div>
    </div>
  );
}

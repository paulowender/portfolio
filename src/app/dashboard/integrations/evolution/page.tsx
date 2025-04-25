'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { EvolutionInstance } from '@/types/messaging';
import EvolutionProviderCard from '@/components/messaging/EvolutionProviderCard';
import EvolutionInstanceManager from '@/components/messaging/EvolutionInstanceManager';
import { motion } from 'framer-motion';
import axiosClient from '@/lib/axios-client';

export default function EvolutionIntegrationPage() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [showInstanceManager, setShowInstanceManager] = useState(false);
  const [instances, setInstances] = useState<EvolutionInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;

      try {
        const response = await axiosClient.get('/api/evolution/config');

        if (response.status === 200) {
          const { config } = response.data;
          setApiKey(config.apiKey || '');
          setBaseUrl(config.baseUrl || '');
          setIsEnabled(config.isEnabled || false);
        }
      } catch (err) {
        console.error('Error fetching Evolution API configuration:', err);
        setError('Failed to load Evolution API configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [user]);

  const handleSaveConfig = async (apiKey: string, baseUrl: string, isEnabled: boolean) => {
    if (!user) return;

    try {
      const response = await axiosClient.post('/api/evolution/config', {
        apiKey,
        baseUrl,
        isEnabled,
      });

      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to save configuration');
      }

      setApiKey(apiKey);
      setBaseUrl(baseUrl);
      setIsEnabled(isEnabled);
    } catch (err: any) {
      console.error('Error saving Evolution API configuration:', err);
      throw err;
    }
  };

  const handleTestConnection = async (apiKey: string, baseUrl: string) => {
    if (!user) return;

    try {
      const response = await axiosClient.post('/api/evolution/test', {
        apiKey,
        baseUrl,
      });

      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to connect to Evolution API');
      }
    } catch (err: any) {
      console.error('Error testing Evolution API connection:', err);
      throw err;
    }
  };

  const fetchInstances = async () => {
    if (!user || !isEnabled) return;

    try {
      const response = await axiosClient.get('/api/evolution/instances');

      if (response.status === 200) {
        setInstances(response.data.instances || []);
      }
    } catch (err: any) {
      console.error('Error fetching instances:', err);
      setError(err.response?.data?.error || 'Failed to fetch instances');
    }
  };

  const handleAddInstance = async (name: string) => {
    if (!user || !isEnabled) return;

    try {
      const response = await axiosClient.post('/api/evolution/instances', {
        name,
      });

      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to add instance');
      }

      await fetchInstances();
    } catch (err: any) {
      console.error('Error adding instance:', err);
      throw new Error(err.response?.data?.error || 'Failed to add instance');
    }
  };

  const handleGetQRCode = async (instanceId: string) => {
    if (!user || !isEnabled) return '';

    try {
      const response = await axiosClient.get(`/api/evolution/instances/${instanceId}`);

      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to get QR code');
      }

      return response.data.qrcode;
    } catch (err: any) {
      console.error('Error getting QR code:', err);
      throw new Error(err.response?.data?.error || 'Failed to get QR code');
    }
  };

  const handleInstanceAction = async (
    instanceId: string,
    action: 'connect' | 'disconnect' | 'delete',
  ) => {
    if (!user || !isEnabled) return;

    try {
      if (action === 'delete') {
        const response = await axiosClient.delete(`/api/evolution/instances/${instanceId}`);

        if (response.status !== 200) {
          throw new Error(response.data.error || 'Failed to delete instance');
        }
      } else {
        const response = await axiosClient.post(`/api/evolution/instances/${instanceId}`, {
          action,
        });

        if (response.status !== 200) {
          throw new Error(response.data.error || `Failed to ${action} instance`);
        }
      }

      await fetchInstances();
    } catch (err: any) {
      console.error(`Error ${action}ing instance:`, err);
      throw new Error(err.response?.data?.error || `Failed to ${action} instance`);
    }
  };

  const handleOpenInstanceManager = async () => {
    await fetchInstances();
    setShowInstanceManager(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
        <h1 className="text-3xl font-bold mb-2">WhatsApp Messaging Integration</h1>
        <p className="text-gray-400 mb-8">
          Connect to WhatsApp via Evolution API v2 for client communication and automation.
        </p>

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          <EvolutionProviderCard
            apiKey={apiKey}
            baseUrl={baseUrl}
            isEnabled={isEnabled}
            onSave={handleSaveConfig}
            onManageInstances={handleOpenInstanceManager}
            onTestConnection={handleTestConnection}
          />
        </div>
      </motion.div>

      {showInstanceManager && (
        <EvolutionInstanceManager
          instances={instances}
          onClose={() => setShowInstanceManager(false)}
          onAddInstance={handleAddInstance}
          onRefreshInstances={fetchInstances}
          onConnectInstance={(id) => handleInstanceAction(id, 'connect')}
          onDisconnectInstance={(id) => handleInstanceAction(id, 'disconnect')}
          onDeleteInstance={(id) => handleInstanceAction(id, 'delete')}
          onGetQRCode={handleGetQRCode}
        />
      )}
    </div>
  );
}

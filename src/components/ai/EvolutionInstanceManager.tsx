'use client';

import { useState, useEffect } from 'react';
import { EvolutionInstance } from '@/types/messaging';
import Button from '@/components/Button';
import { XMarkIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface EvolutionInstanceManagerProps {
  instances: EvolutionInstance[];
  onClose: () => void;
  onAddInstance: (name: string) => Promise<void>;
  onRefreshInstances: () => Promise<void>;
  onConnectInstance: (instanceId: string) => Promise<void>;
  onDisconnectInstance: (instanceId: string) => Promise<void>;
  onDeleteInstance: (instanceId: string) => Promise<void>;
  onGetQRCode: (instanceId: string) => Promise<string>;
}

export default function EvolutionInstanceManager({
  instances,
  onClose,
  onAddInstance,
  onRefreshInstances,
  onConnectInstance,
  onDisconnectInstance,
  onDeleteInstance,
  onGetQRCode,
}: EvolutionInstanceManagerProps) {
  const [newInstanceName, setNewInstanceName] = useState('');
  const [isAddingInstance, setIsAddingInstance] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [error, setError] = useState('');

  const handleAddInstance = async () => {
    if (!newInstanceName) {
      setError('Instance name is required');
      return;
    }

    setIsAddingInstance(true);
    setError('');

    try {
      await onAddInstance(newInstanceName);
      setNewInstanceName('');
    } catch (err: any) {
      setError(err.message || 'Failed to add instance');
    } finally {
      setIsAddingInstance(false);
    }
  };

  const handleRefreshInstances = async () => {
    setIsRefreshing(true);
    setError('');

    try {
      await onRefreshInstances();
    } catch (err: any) {
      setError(err.message || 'Failed to refresh instances');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGetQRCode = async (instanceId: string) => {
    setIsLoadingQR(true);
    setError('');
    setSelectedInstance(instanceId);

    try {
      const qrCodeData = await onGetQRCode(instanceId);
      setQrCode(qrCodeData);
    } catch (err: any) {
      setError(err.message || 'Failed to get QR code');
      setQrCode(null);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const handleInstanceAction = async (
    instanceId: string,
    action: 'connect' | 'disconnect' | 'delete',
  ) => {
    setError('');
    setSelectedInstance(instanceId);

    try {
      if (action === 'connect') {
        await onConnectInstance(instanceId);
      } else if (action === 'disconnect') {
        await onDisconnectInstance(instanceId);
      } else if (action === 'delete') {
        await onDeleteInstance(instanceId);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${action} instance`);
    } finally {
      setSelectedInstance(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Manage WhatsApp Instances</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-end space-x-3 mb-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                New Instance Name
              </label>
              <input
                type="text"
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter instance name"
              />
            </div>
            <Button
              onClick={handleAddInstance}
              isLoading={isAddingInstance}
              disabled={!newInstanceName}
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Create a new WhatsApp instance to connect with the Evolution API
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Your Instances</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshInstances}
            isLoading={isRefreshing}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {instances.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No instances found. Create your first WhatsApp instance above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {instances.map((instance) => (
              <div key={instance.id} className="p-4 border rounded-lg border-gray-700 bg-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{instance.name}</h4>
                    <p className="text-sm text-gray-400">
                      {instance.number ? `Connected: ${instance.number}` : 'Not connected'}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 text-xs rounded-full ${
                      instance.status === 'connected'
                        ? 'bg-green-900 text-green-300 border border-green-700'
                        : instance.status === 'connecting'
                        ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                        : 'bg-red-900 text-red-300 border border-red-700'
                    }`}
                  >
                    {instance.status === 'connected'
                      ? 'Connected'
                      : instance.status === 'connecting'
                      ? 'Connecting'
                      : 'Disconnected'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {instance.status === 'disconnected' && (
                    <Button
                      size="sm"
                      onClick={() => handleGetQRCode(instance.id)}
                      isLoading={isLoadingQR && selectedInstance === instance.id}
                    >
                      Get QR Code
                    </Button>
                  )}
                  {instance.status === 'connected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInstanceAction(instance.id, 'disconnect')}
                      isLoading={selectedInstance === instance.id && !isLoadingQR}
                    >
                      Disconnect
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInstanceAction(instance.id, 'delete')}
                    isLoading={selectedInstance === instance.id && !isLoadingQR}
                  >
                    Delete
                  </Button>
                </div>

                {qrCode && selectedInstance === instance.id && (
                  <div className="mt-4 p-4 bg-white flex justify-center rounded-lg">
                    <img
                      src={`data:image/png;base64,${qrCode}`}
                      alt="WhatsApp QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

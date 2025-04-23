'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadProjectImage } from '@/lib/projects';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function TestUploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setError('');
    addLog(`Starting upload of file: ${file.name}`);

    try {
      addLog(`User ID: ${user.id}`);
      const { url, error } = await uploadProjectImage(file, user.id);

      if (error) {
        addLog(`Upload error: ${JSON.stringify(error)}`);
        setError(error.message || 'Failed to upload image');
      } else if (url) {
        addLog(`Upload successful: ${url}`);
        setUploadedUrl(url);
      }
    } catch (err: any) {
      addLog(`Exception: ${err.message}`);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  const checkStorage = async () => {
    addLog('Checking storage...');
    try {
      // Get the session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        addLog('No session token found. Please log in again.');
        return;
      }

      addLog(`Got session token: ${token.substring(0, 10)}...`);

      // Pass the token in the Authorization header
      const response = await fetch('/api/test-upload', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      addLog(`Storage check result: ${JSON.stringify(data, null, 2)}`);
    } catch (err: any) {
      addLog(`Storage check error: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Test Upload</h1>
        <p>Please log in to test uploads.</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Test Upload</h1>

      <div className="mb-6">
        <p className="mb-2">Logged in as: {user.email}</p>
        <p className="mb-2">User ID: {user.id}</p>
      </div>

      <div className="mb-6">
        <button
          onClick={checkStorage}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mr-4"
        >
          Check Storage
        </button>
      </div>

      <div className="mb-6">
        <label className="block mb-2">Select an image to upload:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 ${
            !file || uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {uploadedUrl && (
        <div className="mb-6">
          <p className="mb-2">Uploaded successfully:</p>
          <div className="border border-gray-300 rounded p-4">
            <img src={uploadedUrl} alt="Uploaded" className="max-w-full h-auto max-h-64" />
            <p className="mt-2 text-sm break-all">{uploadedUrl}</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Logs</h2>
        <div className="bg-gray-900 p-4 rounded h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1 font-mono text-sm">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Database, Upload } from 'lucide-react';
import Button from '@/components/Button';
import { Input } from '@/components/ui/input';
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
  const addLog = (message: string) => setLogs((current) => [...current, `${new Date().toISOString()}: ${message}`]);

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    setError('');
    addLog(`Starting upload of file: ${file.name}`);
    try {
      const result = await uploadProjectImage(file, user.id);
      if (result.error) {
        addLog(`Upload error: ${JSON.stringify(result.error)}`);
        setError(result.error.message || 'Failed to upload image');
      } else if (result.url) {
        addLog(`Upload successful: ${result.url}`);
        setUploadedUrl(result.url);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      addLog(`Exception: ${message}`);
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const checkStorage = async () => {
    addLog('Checking storage…');
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) { addLog('No active session. Please log in again.'); return; }
      addLog('Authenticated session found.');
      const response = await fetch('/api/test-upload', { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      addLog(`Storage check result: ${JSON.stringify(result, null, 2)}`);
    } catch (err: unknown) {
      addLog(`Storage check error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-7">
          <h1 className="text-2xl font-semibold">Test upload</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please log in to test storage uploads.</p>
          <Button className="mt-6" onClick={() => router.push('/login')}>Go to login</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-border pb-7">
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">Storage upload test</h1>
          <p className="mt-2 text-sm text-muted-foreground">Authenticated as {user.email}</p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.9fr]">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Upload image</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose an image and verify the project storage pipeline.</p>
            <Input className="mt-5 file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-foreground" type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={handleUpload} disabled={!file || uploading} isLoading={uploading}><Upload className="mr-2 size-4" />Upload image</Button>
              <Button variant="outline" onClick={checkStorage}><Database className="mr-2 size-4" />Check storage</Button>
            </div>
            {error ? <div role="alert" className="mt-5 rounded-xl border border-destructive/35 bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}
            {uploadedUrl ? <div className="mt-6 overflow-hidden rounded-xl border border-border bg-secondary p-3"><Image width={1920} height={1080} src={uploadedUrl} alt="Uploaded preview" className="max-h-72 w-full rounded-lg object-contain" /><p className="mt-3 break-all font-mono text-xs text-muted-foreground">{uploadedUrl}</p></div> : null}
          </section>

          <section className="rounded-2xl border border-border bg-[#07080B] p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="font-mono text-sm text-foreground">Activity log</h2><span className="font-mono text-xs text-muted-foreground">{logs.length}</span></div>
            <div className="mt-4 h-80 overflow-y-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-6 text-muted-foreground">
              {logs.length ? logs.map((log, index) => <div key={`${log}-${index}`} className="break-all">{log}</div>) : <p>No logs yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

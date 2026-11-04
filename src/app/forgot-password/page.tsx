'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Mail } from 'lucide-react';
import Button from '@/components/Button';
import AuthShell from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const result = await resetPassword(email);
      if (result.error) throw result.error;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending the reset password email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email address and we’ll send you a secure link to choose a new password."
      footer={<Link href="/login" className="inline-flex min-h-10 items-center rounded-lg px-2 font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Back to login</Link>}
    >
      {error ? <div role="alert" className="mb-5 break-words rounded-xl border border-destructive/35 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
      {success ? (
        <div role="status" className="flex gap-3 rounded-xl border border-success/35 bg-success/10 p-4 text-sm leading-6 text-foreground">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          <div><p className="font-semibold">Password reset email sent</p><p className="mt-1 text-muted-foreground">Check your inbox for the link to reset your password.</p></div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">Email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="pl-10" placeholder="you@company.com" />
            </div>
          </div>
          <Button type="submit" className="w-full" isLoading={loading}>Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}

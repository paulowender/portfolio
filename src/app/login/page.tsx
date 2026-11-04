'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import Button from '@/components/Button';
import AuthShell from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const t = useTranslations('login');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = isLogin ? await signIn(email, password) : await signUp(email, password, name);
      if (result.error) throw result.error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
      setLoading(false);
    }
  };

  const modeSwitch = (
    <>
      {isLogin ? t('noAccount') : t('hasAccount')}{' '}
      <button
        type="button"
        onClick={() => { setIsLogin((current) => !current); setError(''); }}
        className="min-h-10 rounded-lg px-1 font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isLogin ? t('signUp') : t('signIn')}
      </button>
    </>
  );

  return (
    <AuthShell
      title={isLogin ? t('signInTitle') : t('signUpTitle')}
      description={isLogin ? t('welcomeBack') : t('createWorkspace')}
      footer={modeSwitch}
    >
      {error ? <div role="alert" className="mb-5 break-words rounded-xl border border-destructive/35 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {!isLogin ? (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">{t('name')}</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="name" name="name" type="text" required value={name} onChange={(event) => setName(event.target.value)} className="pl-10" placeholder={t('namePlaceholder')} />
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">{t('email')}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="pl-10" placeholder={t('emailPlaceholder')} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">{t('password')}</label>
            {isLogin ? <Link href="/forgot-password" className="rounded-md text-sm font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t('forgotPassword')}</Link> : null}
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="password" name="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} required value={password} onChange={(event) => setPassword(event.target.value)} className="pl-10" placeholder={t('passwordPlaceholder')} />
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={loading}>{isLogin ? t('signIn') : t('signUp')}</Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        <span>{t('orContinueWith')}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-secondary text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="sr-only">{t('signInWithGoogle')}</span>
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.198-2.701-6.735-2.701C7.006 1.906 2.513 6.399 2.513 11.938S7.006 21.97 12.545 21.97c8.445 0 10.452-7.888 9.629-11.731h-9.629z" /></svg>
        </button>
        <button type="button" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-secondary text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="sr-only">{t('signInWithGitHub')}</span>
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>
        </button>
      </div>
    </AuthShell>
  );
}

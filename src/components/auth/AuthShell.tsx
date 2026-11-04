'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface AuthShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthShell({ title, description, children, footer }: AuthShellProps) {
  const t = useTranslations('authShell');
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(320px,0.78fr)_minmax(520px,1.22fr)]">
      <section className="relative hidden overflow-hidden border-r border-border bg-surface px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16">
        <Link href="/" className="inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-11 items-center justify-center rounded-full border border-border-strong bg-secondary text-lg font-semibold text-foreground">W</span>
          <span className="font-semibold tracking-[-0.02em] text-foreground">Wender Tech</span>
        </Link>
        <div className="max-w-lg pb-8">
          <p className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-foreground xl:text-5xl">
            {t('headline')}
          </p>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{t('workspace')}</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-full border border-border-strong bg-secondary font-semibold text-foreground">W</span>
            <span className="font-semibold text-foreground">Wender Tech</span>
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">{title}</h1>
            {description ? <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p> : null}
          </header>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] sm:p-7">
            {children}
          </div>

          {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}

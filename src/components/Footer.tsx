'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const links = [
    { href: '/', label: t('home') },
    { href: '/#projects', label: t('projects') },
    { href: '/#about', label: t('about') },
    { href: '/#contact', label: t('contact') },
    { href: '/login', label: t('login') },
  ];

  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex size-10 items-center justify-center rounded-full border border-border-strong bg-secondary font-semibold">W</span>
              <span className="font-semibold">Wender Tech</span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">{t('description')}</p>
          </div>
          <nav aria-label={t('quickLinks')} className="flex flex-wrap gap-x-6 gap-y-3 lg:justify-end">
            {links.map((link) => <Link key={link.href} href={link.href} className="inline-flex min-h-10 items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{link.label}</Link>)}
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t('copyright', { year: currentYear })}</p>
          <Link href="/#contact" className="inline-flex min-h-10 w-fit items-center gap-2 font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t('contact')}<ArrowUpRight className="size-3.5" /></Link>
        </div>
      </div>
    </footer>
  );
}

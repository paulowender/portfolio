'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  CreditCard,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/dashboard/PageHeader';
import StatusBadge from '@/components/dashboard/StatusBadge';

export default function IntegrationsPage() {
  const t = useTranslations('integrationsPage');
  const integrations = [
    { id: 'nfse', nameKey: 'nfse', descriptionKey: 'nfseDescription', icon: CreditCard, href: '/dashboard/integrations/nfse', isAvailable: true },
    { id: 'ai', nameKey: 'aiProviders', descriptionKey: 'aiProvidersDescription', icon: Bot, href: '/dashboard/integrations/ai', isAvailable: true },
    { id: 'messaging', nameKey: 'messagingServices', descriptionKey: 'messagingServicesDescription', icon: MessageCircle, href: '/dashboard/integrations/evolution', isAvailable: true },
    { id: 'email', nameKey: 'emailServices', descriptionKey: 'emailServicesDescription', icon: Mail, href: '/dashboard/integrations/resend', isAvailable: true },
    { id: 'calendar', nameKey: 'calendarServices', descriptionKey: 'calendarServicesDescription', icon: CalendarDays, href: '/dashboard/integrations/calendar', isAvailable: false },
    { id: 'payment', nameKey: 'paymentProcessors', descriptionKey: 'paymentProcessorsDescription', icon: CreditCard, href: '/dashboard/integrations/payment', isAvailable: false },
  ] as const;
  const available = integrations.filter((integration) => integration.isAvailable);
  const planned = integrations.filter((integration) => !integration.isAvailable);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t('title')} description={t('description')} />

      <section aria-labelledby="available-integrations" className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="available-integrations" className="text-base font-semibold text-foreground">{t('available')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('availableDescription')}</p>
            </div>
            <StatusBadge tone="success">{available.length} {t('services')}</StatusBadge>
          </div>
        </div>

        <div className="divide-y divide-border">
          {available.map((integration) => (
            <Link
              key={integration.id}
              href={integration.href}
              className="group grid min-h-28 gap-4 px-5 py-5 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[48px_minmax(0,1fr)_auto] sm:items-center sm:px-6"
            >
              <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
                <integration.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">{t(integration.nameKey)}</span>
                  <StatusBadge tone="info">{t('available')}</StatusBadge>
                </span>
                <span className="mt-1.5 block max-w-3xl text-sm leading-6 text-muted-foreground">{t(integration.descriptionKey)}</span>
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                {t('configure')}
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="planned-integrations" className="mt-8">
        <h2 id="planned-integrations" className="text-lg font-semibold text-foreground">{t('comingSoon')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('plannedDescription')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {planned.map((integration) => (
            <div key={integration.id} className="flex gap-4 rounded-2xl border border-border bg-card/60 p-5 text-muted-foreground">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary">
                <integration.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{t(integration.nameKey)}</h3>
                  <StatusBadge tone="neutral">{t('comingSoon')}</StatusBadge>
                </div>
                <p className="mt-2 text-sm leading-6">{t(integration.descriptionKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

'use client';

import { Code2, Database, Server, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePortfolio } from '@/components/PortfolioData';

export default function ServicesSection() {
  const { portfolioData, loading } = usePortfolio();
  const t = useTranslations('services');
  const defaults = [
    { name: t('frontend'), description: t('frontendDesc') },
    { name: t('backend'), description: t('backendDesc') },
    { name: t('mobile'), description: t('mobileDesc') },
    { name: t('database'), description: t('databaseDesc') },
  ];
  const services = portfolioData?.company?.services?.length
    ? portfolioData.company.services.map((name) => ({ name, description: '' }))
    : defaults;

  const iconFor = (service: string) => {
    const normalized = service.toLowerCase();
    if (normalized.includes('back') || normalized.includes('server')) return Server;
    if (normalized.includes('mobile')) return Smartphone;
    if (normalized.includes('dados') || normalized.includes('data') || normalized.includes('devops')) return Database;
    return Code2;
  };

  return (
    <section id="services" className="bg-background py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[.72fr_1.28fr] lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">{t('title')}</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">{portfolioData?.company?.description || t('defaultDescription')}</p>
        </div>

        <div className="border-t border-border">
          {loading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse border-b border-border bg-card/40" />) : services.map((service, index) => {
            const Icon = iconFor(service.name);
            return (
              <article key={`${service.name}-${index}`} className="grid gap-4 border-b border-border py-7 sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:items-start">
                <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-primary"><Icon className="size-5" aria-hidden="true" /></span>
                <div><h3 className="text-xl font-semibold text-foreground">{service.name}</h3>{service.description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{service.description}</p> : null}</div>
                <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

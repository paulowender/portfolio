'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Code2 } from 'lucide-react';
import { usePortfolio } from '@/components/PortfolioData';
import Button from '@/components/Button';
import { useTranslations } from 'next-intl';

interface HeroSectionProps {
  scrollToProjects: () => void;
}

export default function HeroSection({ scrollToProjects }: HeroSectionProps) {
  const { portfolioData, loading } = usePortfolio();
  const reduceMotion = useReducedMotion();
  const t = useTranslations('hero');
  const featuredProject = portfolioData?.featuredProjects?.at(-1);

  return (
    <section className="relative min-h-screen overflow-hidden border-b border-border bg-background pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1.04fr_.96fr] lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            {portfolioData?.company?.name || 'Wender Tech'}
          </div>
          {loading ? (
            <div className="space-y-5" aria-label="Carregando apresentação">
              <div className="h-20 max-w-2xl animate-pulse rounded-2xl bg-secondary" />
              <div className="h-24 max-w-xl animate-pulse rounded-2xl bg-secondary" />
            </div>
          ) : (
            <>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">{t('headline')}</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">{portfolioData?.company?.description || t('defaultDescription')}</p>
            </>
          )}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={scrollToProjects}>{t('viewProjects')}<ArrowDown className="ml-2 size-4" /></Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })}>{t('contactUs')}</Button>
          </div>
        </motion.div>

        <div className="relative lg:pl-8">
          <div className="absolute -left-10 top-10 hidden h-[78%] w-px bg-gradient-to-b from-transparent via-border-strong to-transparent lg:block" />
          <div className="overflow-hidden rounded-[28px] border border-border-strong bg-card shadow-[0_28px_90px_rgba(0,0,0,.38)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Code2 className="size-4 text-primary" />{t('selectedWork')}</div>
              <span className="text-xs text-muted-foreground">01</span>
            </div>
            <div className="relative aspect-[4/3] bg-secondary">
              {featuredProject?.imageUrl ? (
                <Image src={featuredProject.imageUrl} alt={featuredProject.title} fill priority className="object-cover" sizes="(min-width: 1024px) 42vw, 92vw" />
              ) : (
                <div className="flex h-full items-center justify-center p-10 text-center text-sm text-muted-foreground">{loading ? t('loadingWork') : t('workComingSoon')}</div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-6 pt-20">
                <h2 className="text-xl font-semibold text-foreground">{featuredProject?.title || portfolioData?.company?.name || 'Wender Tech'}</h2>
                {featuredProject?.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{featuredProject.description}</p> : null}
                {featuredProject?.liveUrl ? <a href={featuredProject.liveUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t('openProject')}<ArrowUpRight className="size-4" /></a> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

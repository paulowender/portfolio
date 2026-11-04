'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePortfolio } from '@/components/PortfolioData';
import ProjectCard from '@/components/ProjectCard';

interface ProjectsSectionProps {
  innerRef?: React.RefObject<HTMLElement | null>;
}

export default function ProjectsSection({ innerRef }: ProjectsSectionProps) {
  const { portfolioData, loading } = usePortfolio();
  const t = useTranslations('projects');
  const featuredProjects = portfolioData?.featuredProjects?.toReversed() || [];

  return (
    <section ref={innerRef} id="projects" className="border-y border-border bg-surface py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">{t('title')}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{t('description')}</p>
          </div>
          <Link href="/projects" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {t('viewAllProjects')}<ArrowRight className="size-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2" aria-label="Carregando projetos">
            <div className="min-h-[440px] animate-pulse rounded-2xl border border-border bg-card md:col-span-2" />
            <div className="min-h-80 animate-pulse rounded-2xl border border-border bg-card" />
            <div className="min-h-80 animate-pulse rounded-2xl border border-border bg-card" />
          </div>
        ) : featuredProjects.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {featuredProjects.map((project, index) => <ProjectCard key={project.id} project={project} prominent={index === 0} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">{t('noProjects')}</div>
        )}
      </div>
    </section>
  );
}

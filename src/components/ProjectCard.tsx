'use client';

import Image from 'next/image';
import { ExternalLink, Github } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface PublicProject {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  technologies: string[];
}

interface ProjectCardProps {
  project: PublicProject;
  prominent?: boolean;
}

export default function ProjectCard({ project, prominent = false }: ProjectCardProps) {
  const t = useTranslations('projects');
  const tCommon = useTranslations('common');

  return (
    <article className={`group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-border-strong ${prominent ? 'md:col-span-2 md:grid md:grid-cols-[1.2fr_.8fr]' : ''}`}>
      <div className={`relative overflow-hidden bg-secondary ${prominent ? 'min-h-64 md:min-h-[360px]' : 'aspect-[16/10]'}`}>
        {project.imageUrl ? (
          <Image src={project.imageUrl} alt={project.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" sizes={prominent ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'} />
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center text-sm text-muted-foreground">{tCommon('noImage')}</div>
        )}
      </div>

      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <h3 className={`${prominent ? 'text-2xl' : 'text-xl'} font-semibold tracking-[-0.025em] text-foreground`}>{project.title}</h3>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.technologies.slice(0, prominent ? 6 : 4).map((technology) => (
            <span key={technology} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">{technology}</span>
          ))}
          {project.technologies.length > (prominent ? 6 : 4) ? <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">+{project.technologies.length - (prominent ? 6 : 4)}</span> : null}
        </div>
        <div className="mt-auto flex flex-wrap gap-4 pt-6">
          {project.liveUrl ? <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ExternalLink className="size-4" />{t('viewLive')}</a> : null}
          {project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Github className="size-4" />{t('viewCode')}</a> : null}
        </div>
      </div>
    </article>
  );
}

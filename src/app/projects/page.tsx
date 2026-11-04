'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard, { type PublicProject } from '@/components/ProjectCard';
import axiosClient from '@/lib/axios-client';

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosClient.get('/api/public/projects');
        if (response.data?.projects) setProjects(response.data.projects);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <div className="flex-1 pb-24 pt-32 sm:pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="max-w-3xl border-b border-border pb-10">
            <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">{t('allProjects')}</h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">{t('allProjectsDescription')}</p>
          </header>

          {loading ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2" aria-label="Carregando projetos">
              {Array.from({ length: 4 }).map((_, index) => <div key={index} className={`min-h-80 animate-pulse rounded-2xl border border-border bg-card ${index === 0 ? 'md:col-span-2 md:min-h-[440px]' : ''}`} />)}
            </div>
          ) : projects.length ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {projects.map((project, index) => <ProjectCard key={project.id} project={project} prominent={index === 0} />)}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">{t('noProjects')}</div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

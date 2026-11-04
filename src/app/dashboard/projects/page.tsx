'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { fetchProjects, deleteProjectApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import StatusBadge from '@/components/dashboard/StatusBadge';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const t = useTranslations('projectsPage');

  useEffect(() => {
    // Skip if already fetching or no user
    if (isFetching || !user) {
      if (!user) {
        setLoading(false);
        setError(t('loginRequired'));
      }
      return;
    }

    const loadProjects = async () => {
      try {
        setError(null);
        setLoading(true);
        setIsFetching(true);

        console.log('Loading projects for user:', user.id);
        const { data, error } = await fetchProjects(user.id);

        if (error) {
          console.error('Error loading projects:', error);
          setError(error.message || 'Failed to load projects');
        } else if (data) {
          console.log('Projects loaded successfully:', data.length);
          setProjects(data);
        } else {
          console.log('No projects found');
          setProjects([]);
        }
      } catch (err: any) {
        console.error('Exception loading projects:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    loadProjects();
  }, [user, isFetching]);

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      setDeleteLoading(id);
      setError(null);

      try {
        const { error } = await deleteProjectApi(id);

        if (error) {
          console.error('Error deleting project:', error);
          setError(error.message || 'Failed to delete project');
        } else {
          console.log('Project deleted successfully:', id);
          // Update the local state immediately for a responsive UI
          setProjects(projects.filter((project: any) => project.id !== id));

          // The cache will be invalidated by deleteProjectApi, so we don't need to do anything else
        }
      } catch (err: any) {
        console.error('Exception deleting project:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button asChild size="lg">
            <Link href="/dashboard/projects/new">
              <Plus className="size-4" />
              {t('addProject')}
            </Link>
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-[#5f343b] bg-[#2d1b1e] p-4 text-sm text-[#f0a2ad]" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="size-10 animate-spin rounded-full border-2 border-border border-t-primary"></div>
        </div>
      ) : projects.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full divide-y divide-border">
            <thead className="bg-[#101116]">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground"
                >
                  {t('project')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground"
                >
                  {t('technologies')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground"
                >
                  {t('featured')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground"
                >
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {projects.map((project: any) => (
                <tr key={project.id} className="transition-colors hover:bg-[#18181f]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-[#211e2a]">
                        {project.imageUrl && (
                          <Image
                            width={100}
                            height={100}
                            src={project.imageUrl}
                            alt={project.title}
                            className="h-11 w-11 object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-foreground">{project.title}</div>
                        <div className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                          {project.description?.substring(0, 70) || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                    <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((tech: string) => (
                        <span
                          key={tech}
                          className="rounded-lg bg-[#211e2a] px-2 py-1 text-xs text-[#c6c1cd]"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="rounded-lg bg-[#211e2a] px-2 py-1 text-xs text-[#c6c1cd]">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge tone={project.featured ? 'success' : 'neutral'}>
                      {project.featured ? t('yes') : t('no')}
                      </StatusBadge>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="mr-2 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                      {t('edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deleteLoading === project.id}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-muted-foreground transition-colors hover:bg-[#2d1b1e] hover:text-[#f0a2ad] disabled:opacity-50"
                    >
                      {deleteLoading === project.id ? (
                        <div className="size-4 animate-spin rounded-full border-2 border-[#5f343b] border-t-[#f0a2ad]"></div>
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<FolderKanban className="size-5" />}
          title={t('noProjectsYet')}
          description={t('startByAdding')}
          action={
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="size-4" />
                {t('addFirstProject')}
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}

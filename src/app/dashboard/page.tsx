'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, Clock3, FolderKanban, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useProjects } from '@/hooks/usePortfolioQuery';
import { useReminders } from '@/hooks/useReminderQuery';
import { getDashboardStatus, getPrioritySummary } from '@/lib/dashboard-status';
import PendingReminders from '@/components/dashboard/PendingReminders';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardProject {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  technologies?: string[];
  featured?: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const { data: projectData, isLoading: projectsLoading } = useProjects(user?.id);
  const {
    data: reminders,
    isLoading: remindersLoading,
    isError: remindersError,
  } = useReminders({ completed: false });

  const projects = (projectData || []) as DashboardProject[];
  const reminderState = remindersLoading ? 'loading' : remindersError ? 'error' : 'ready';
  const status = getDashboardStatus(reminders, reminderState, new Date());
  const prioritySummary = getPrioritySummary(status);
  const statusTitle =
    status.tone === 'controlled'
      ? t('statusControlled')
      : status.tone === 'attention'
        ? t('statusAttention')
        : t('statusNeutral');
  const statusDescription =
    status.tone === 'controlled'
      ? t('statusControlledDescription')
      : status.tone === 'attention'
        ? t('statusAttentionDescription', { count: status.overdueCount })
        : t('statusNeutralDescription');
  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-sm capitalize text-muted-foreground">{formattedDate}</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.5rem]">
            {statusTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {statusDescription}
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/dashboard/projects/new">
            <Plus className="size-4" />
            {t('addProject')}
          </Link>
        </Button>
      </section>

      <section className="grid gap-3 md:grid-cols-3" aria-label={t('summaryLabel')}>
        <Link
          href="/dashboard/projects"
          className="group flex min-h-36 flex-col justify-between rounded-2xl border border-primary bg-primary p-5 text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">{t('projects')}</span>
            <FolderKanban className="size-5" strokeWidth={1.8} />
          </div>
          <div>
            <span className="text-4xl font-semibold tracking-[-0.04em]">
              {projectsLoading ? '—' : projects.length}
            </span>
            <span className="ml-2 text-xs text-[#3d344c]">{t('totalProjects')}</span>
          </div>
        </Link>

        <Link
          href="/dashboard/reminders"
          className="flex min-h-36 flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[#4a4658] hover:bg-[#17181e]"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-muted-foreground">{t('reminders')}</span>
            <Clock3 className="size-5 text-[#b9ace0]" strokeWidth={1.8} />
          </div>
          <div>
            <span className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
              {remindersLoading ? '—' : reminders?.length || 0}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              {status.dueTodayCount > 0
                ? t('dueToday', { count: status.dueTodayCount })
                : t('activeReminders')}
            </span>
          </div>
        </Link>

        <Link
          href="/dashboard/calendar"
          className="flex min-h-36 flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[#4a4658] hover:bg-[#17181e]"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-muted-foreground">{t('upcoming')}</span>
            <CalendarDays className="size-5 text-[#b9ace0]" strokeWidth={1.8} />
          </div>
          <div>
            <span className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
              {remindersLoading ? '—' : Math.min(status.priority.length, 3)}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">{t('nextItems')}</span>
          </div>
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t('recentProjects')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('recentProjectsDescription')}</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/projects">{t('viewAll')}</Link>
            </Button>
          </div>

          {projectsLoading ? (
            <div className="space-y-3 p-5 sm:p-6">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-16 w-full" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="divide-y divide-border">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="grid gap-3 px-5 py-4 transition-colors hover:bg-[#18181f] sm:grid-cols-[minmax(0,1.2fr)_minmax(160px,.7fr)_auto] sm:items-center sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-border bg-[#211e2a]">
                      {project.imageUrl ? (
                        <Image src={project.imageUrl} alt="" fill className="object-cover" sizes="44px" />
                      ) : (
                        <Sparkles className="absolute inset-0 m-auto size-4 text-[#9189a1]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{project.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {project.description || t('noProjectDescription')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(project.technologies || []).slice(0, 2).map((technology) => (
                      <span key={technology} className="rounded-lg bg-[#211e2a] px-2 py-1 text-xs text-[#c5bdd2]">
                        {technology}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-[#b9ace0]">
                    {project.featured ? t('featured') : t('edit')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <FolderKanban className="mx-auto size-8 text-[#716b7b]" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">{t('noProjectsYet')}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t('startByAdding')}</p>
              <Button asChild className="mt-6">
                <Link href="/dashboard/projects/new">{t('addFirstProject')}</Link>
              </Button>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[#3a3546] bg-[#18171e] p-5">
            <p className="text-sm text-muted-foreground">{t('todayPriority')}</p>
            <p className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-foreground">
              {prioritySummary === 'unavailable' ? '—' : String(status.overdueCount + status.dueTodayCount).padStart(2, '0')}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {prioritySummary === 'unavailable'
                ? t('priorityUnavailable')
                : prioritySummary === 'overdue'
                ? t('priorityOverdue', { count: status.overdueCount })
                : prioritySummary === 'today'
                  ? t('priorityToday', { count: status.dueTodayCount })
                  : t('priorityClear')}
            </p>
            <Button asChild variant="secondary" className="mt-5 w-full justify-between">
              <Link href="/dashboard/reminders">
                {t('reviewReminders')}
                <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>
          <PendingReminders />
        </aside>
      </section>
    </div>
  );
}

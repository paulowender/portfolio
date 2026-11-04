'use client';

import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';

export default function CalendarPage() {
  const t = useTranslations('calendarPage');

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <EmptyState
        icon={<CalendarDays className="size-5" />}
        title={t('comingSoon')}
        description={t('comingSoonDescription')}
      />
    </div>
  );
}

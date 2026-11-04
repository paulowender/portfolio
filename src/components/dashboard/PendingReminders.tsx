'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock3 } from 'lucide-react';
import { useReminders } from '@/hooks/useReminderQuery';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import ReminderItem from '../reminders/ReminderItem';
import { useTranslations } from 'next-intl';

export default function PendingReminders() {
  // Fetch all incomplete reminders
  const { data: reminders, isLoading, isError } = useReminders({ completed: false });
  const t = useTranslations('pendingReminders');

  // Sort reminders by due date (closest first)
  const pendingReminders = useMemo(() => {
    if (!reminders) return [];

    return [...reminders].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [reminders]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
          <div className="grid size-9 place-items-center rounded-xl bg-[#211e2a] text-[#b9ace0]">
            <Clock3 className="size-4" />
          </div>
        </div>

        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-[#101116] p-3">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
        <p role="status" className="mt-3 text-sm leading-6 text-muted-foreground">{t('unavailable')}</p>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <Link href="/dashboard/reminders">{t('manageReminders')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
        <div className="grid size-9 place-items-center rounded-xl bg-[#211e2a] text-[#b9ace0]">
          <Clock3 className="size-4" />
        </div>
      </div>

      {pendingReminders.length > 0 ? (
        <>
          <div className="mb-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
            <AnimatePresence>
              {pendingReminders.map((reminder) => (
                <ReminderItem key={reminder.id} reminder={reminder} />
              ))}
            </AnimatePresence>
          </div>

          <Link href="/dashboard/reminders">
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </>
      ) : (
        <div className="py-6 text-center">
          <p className="mb-4 text-sm text-muted-foreground">{t('noReminders')}</p>
          <Link href="/dashboard/reminders">
            <Button variant="outline" size="sm">
              {t('manageReminders')}
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

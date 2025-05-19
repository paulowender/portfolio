'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useReminders } from '@/hooks/useReminderQuery';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import ReminderItem from '../reminders/ReminderItem';

export default function PendingReminders() {
  // Fetch all incomplete reminders
  const { data: reminders, isLoading } = useReminders({ completed: false });

  // Sort reminders by due date (closest first)
  const pendingReminders = useMemo(() => {
    if (!reminders) return [];

    return reminders
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [reminders]);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Lembretes pendentes</h2>
          <div className="bg-yellow-600/20 p-2 rounded-lg">
            <BellIcon className="h-6 w-6 text-yellow-400" />
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Lembretes pendentes</h2>
        <div className="bg-yellow-600/20 p-2 rounded-lg">
          <BellIcon className="h-6 w-6 text-yellow-400" />
        </div>
      </div>

      {pendingReminders.length > 0 ? (
        <>
          <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto pr-1">
            <AnimatePresence>
              {pendingReminders.map((reminder) => (
                <ReminderItem key={reminder.id} reminder={reminder} />
              ))}
            </AnimatePresence>
          </div>

          <Link href="/dashboard/reminders">
            <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1">
              <span>Ver todos</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400 mb-4">Nenhum lembrete pendente</p>
          <Link href="/dashboard/reminders">
            <Button variant="outline" size="sm">
              Gerenciar lembretes
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

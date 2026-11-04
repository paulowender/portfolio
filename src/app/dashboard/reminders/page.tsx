'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Bell, Plus } from 'lucide-react';
import { useReminders } from '@/hooks/useReminderQuery';
import { Reminder, ReminderCategory, ReminderPriority } from '@/types/reminder';
import ReminderItem from '@/components/reminders/ReminderItem';
import ReminderForm from '@/components/reminders/ReminderForm';
import { ReminderFilters as FilterOptions } from '@/components/reminders/ReminderFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';

export default function RemindersPage() {
  const { toast } = useToast();
  const t = useTranslations('remindersPage');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | undefined>(undefined);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    categories: [],
    priorities: [],
    completed: null,
    upcoming: false,
  });

  // Convert filter options to API query parameters
  const queryParams: Record<string, any> = {};
  if (filters.search) queryParams.search = filters.search;
  if (filters.categories.length === 1) queryParams.category = filters.categories[0];
  if (filters.priorities.length === 1) queryParams.priority = filters.priorities[0];
  if (filters.completed !== null) queryParams.completed = filters.completed;
  if (filters.upcoming) queryParams.upcoming = true;

  // Fetch reminders with filters
  const { data: reminders, isLoading, error } = useReminders(queryParams);

  // Filter reminders client-side for multiple categories/priorities
  const filteredReminders = reminders?.filter((reminder) => {
    // Filter by multiple categories
    if (
      filters.categories.length > 1 &&
      !filters.categories.includes(reminder.category as ReminderCategory)
    ) {
      return false;
    }

    // Filter by multiple priorities
    if (
      filters.priorities.length > 1 &&
      !filters.priorities.includes(reminder.priority as ReminderPriority)
    ) {
      return false;
    }

    return true;
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Handle edit reminder
  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsFormOpen(true);
  };

  // Handle add new reminder
  const handleAddReminder = () => {
    setSelectedReminder(undefined);
    setIsFormOpen(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedReminder(undefined);
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: t('error'),
        description: t('errorLoading'),
        variant: 'destructive',
      });
    }
  }, [error, toast, t]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button onClick={handleAddReminder} className="flex items-center gap-2">
            <Plus className="size-4" />
            <span>{t('newReminder')}</span>
          </Button>
        }
      />

        {/* <ReminderFilters onFilterChange={handleFilterChange} /> */}

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredReminders && filteredReminders.length > 0 ? (
          // Reminders list
          <AnimatePresence>
            {filteredReminders.map((reminder) => (
              <ReminderItem key={reminder.id} reminder={reminder} onEdit={handleEditReminder} />
            ))}
          </AnimatePresence>
        ) : (
          // Empty state
          <EmptyState
            icon={<Bell className="size-5" />}
            title={t('noRemindersFound')}
            description={
              filters.search ||
                filters.categories.length > 0 ||
                filters.priorities.length > 0 ||
                filters.completed !== null ||
                filters.upcoming
                ? t('noRemindersFiltered')
                : t('noRemindersYet')
            }
            action={<Button onClick={handleAddReminder}>{t('createReminder')}</Button>}
          />
        )}

      {/* Reminder form dialog */}
      <ReminderForm reminder={selectedReminder} isOpen={isFormOpen} onClose={handleCloseForm} />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useReminders } from '@/hooks/useReminderQuery';
import { Reminder, ReminderCategory, ReminderPriority } from '@/types/reminder';
import ReminderItem from '@/components/reminders/ReminderItem';
import ReminderForm from '@/components/reminders/ReminderForm';
import { ReminderFilters as FilterOptions } from '@/components/reminders/ReminderFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';

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
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-gray-400">{t('description')}</p>
          </div>

          <Button onClick={handleAddReminder} className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            <span>{t('newReminder')}</span>
          </Button>
        </div>

        {/* <ReminderFilters onFilterChange={handleFilterChange} /> */}

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700"
          >
            <div className="bg-yellow-600/20 p-4 rounded-full inline-block mb-6">
              <BellIcon className="h-12 w-12 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">{t('noRemindersFound')}</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {filters.search ||
                filters.categories.length > 0 ||
                filters.priorities.length > 0 ||
                filters.completed !== null ||
                filters.upcoming
                ? t('noRemindersFiltered')
                : t('noRemindersYet')}
            </p>
            <Button onClick={handleAddReminder}>{t('createReminder')}</Button>
          </motion.div>
        )}
      </motion.div>

      {/* Reminder form dialog */}
      <ReminderForm reminder={selectedReminder} isOpen={isFormOpen} onClose={handleCloseForm} />
    </div>
  );
}

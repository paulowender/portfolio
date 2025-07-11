'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/lib/axios-client';
import { Reminder, ReminderFormData } from '@/types/reminder';

// Query keys for React Query
export const reminderKeys = {
  all: ['reminders'] as const,
  lists: () => [...reminderKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...reminderKeys.lists(), filters] as const,
  details: () => [...reminderKeys.all, 'detail'] as const,
  detail: (id: string) => [...reminderKeys.details(), id] as const,
};

// Hook to get all reminders with optional filters
export function useReminders(filters: Record<string, any> = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery({
    queryKey: reminderKeys.list(filters),
    queryFn: async () => {
      const { data } = await axiosClient.get(`/api/reminders${queryString}`);
      return data.reminders as Reminder[];
    },
  });
}

// Hook to get a single reminder by ID
export function useReminder(id: string) {
  return useQuery({
    queryKey: reminderKeys.detail(id),
    queryFn: async () => {
      const { data } = await axiosClient.get(`/api/reminders/${id}`);
      return data.reminder as Reminder;
    },
    enabled: !!id,
  });
}

// Hook to create a new reminder
export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderData: ReminderFormData) => {
      const { data } = await axiosClient.post('/api/reminders', reminderData);
      return data.reminder as Reminder;
    },
    onSuccess: () => {
      // Invalidate reminders list queries
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
    },
  });
}

// Hook to update an existing reminder
export function useUpdateReminder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderData: Partial<ReminderFormData>) => {
      const { data } = await axiosClient.put(`/api/reminders/${id}`, reminderData);
      return data.reminder as Reminder;
    },
    onSuccess: (updatedReminder) => {
      // Update the reminder in the cache
      queryClient.setQueryData(reminderKeys.detail(id), updatedReminder);

      // Invalidate reminders list queries
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
    },
  });
}

// Hook to delete a reminder
export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosClient.delete(`/api/reminders/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Remove the reminder from the cache
      queryClient.removeQueries({ queryKey: reminderKeys.detail(id) });

      // Invalidate reminders list queries
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
    },
  });
}

// Hook to toggle a reminder's completed status
export function useToggleReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosClient.post(`/api/reminders/${id}/toggle`);
      return data.reminder as Reminder;
    },
    onSuccess: (updatedReminder) => {
      // Update the reminder in the cache
      queryClient.setQueryData(reminderKeys.detail(updatedReminder.id), updatedReminder);

      // Invalidate reminders list queries
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
    },
  });
}

// Hook to send a notification for a reminder
export function useSendReminderNotification() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosClient.post('/api/reminders/notify', { reminderId: id });
      return data;
    },
  });
}

// Hook to complete a reminder and handle recurrence
export function useCompleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosClient.post(`/api/reminders/${id}/complete`);
      return data;
    },
    onSuccess: (data) => {
      // Update the completed reminder in the cache
      if (data.reminder) {
        queryClient.setQueryData(reminderKeys.detail(data.reminder.id), data.reminder);
      }

      // Add the new occurrence to the cache if it exists
      if (data.nextOccurrence) {
        // Update any existing queries that might include this reminder
        queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      } else {
        // If no new occurrence, just invalidate the lists to remove the completed reminder
        queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      }
    },
  });
}

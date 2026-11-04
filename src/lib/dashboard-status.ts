import type { Reminder } from '@/types/reminder';

export type DashboardStatusTone = 'controlled' | 'attention' | 'neutral';
export type ReminderLoadState = 'loading' | 'ready' | 'error';

export interface DashboardStatus {
  tone: DashboardStatusTone;
  priority: Reminder[];
  overdueCount: number;
  dueTodayCount: number;
}

export type PrioritySummary = 'unavailable' | 'overdue' | 'today' | 'clear';

export function getPrioritySummary(status: DashboardStatus): PrioritySummary {
  if (status.tone === 'neutral') return 'unavailable';
  if (status.overdueCount > 0) return 'overdue';
  if (status.dueTodayCount > 0) return 'today';
  return 'clear';
}

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function getDashboardStatus(
  reminders: Reminder[] | undefined,
  state: ReminderLoadState,
  now: Date
): DashboardStatus {
  if (state !== 'ready' || !reminders) {
    return { tone: 'neutral', priority: [], overdueCount: 0, dueTodayCount: 0 };
  }

  const today = dayStart(now);
  const active = reminders
    .filter((reminder) => !reminder.completed)
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime());

  const overdueCount = active.filter((reminder) => dayStart(new Date(reminder.dueDate)) < today).length;
  const dueTodayCount = active.filter((reminder) => dayStart(new Date(reminder.dueDate)) === today).length;

  return {
    tone: overdueCount > 0 ? 'attention' : 'controlled',
    priority: active,
    overdueCount,
    dueTodayCount,
  };
}

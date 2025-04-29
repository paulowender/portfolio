export type ReminderCategory = 
  | 'general'
  | 'invoice'
  | 'contract'
  | 'meeting'
  | 'deadline'
  | 'follow-up'
  | 'personal';

export type ReminderPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type ReminderRecurrence = 
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly';

export interface Reminder {
  id: string;
  title: string;
  description?: string | null;
  dueDate: Date;
  completed: boolean;
  category: ReminderCategory;
  priority: ReminderPriority;
  recurrence: ReminderRecurrence | null;
  recurrenceEndDate?: Date | null;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  notifyBefore: number; // minutes before to send notification
  color?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderFormData {
  title: string;
  description?: string;
  dueDate: Date;
  category: ReminderCategory;
  priority: ReminderPriority;
  recurrence: ReminderRecurrence | null;
  recurrenceEndDate?: Date | null;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  notifyBefore: number;
  color?: string;
}

export const REMINDER_CATEGORIES: { value: ReminderCategory; label: string; color: string }[] = [
  { value: 'general', label: 'Geral', color: '#6366F1' }, // Indigo
  { value: 'invoice', label: 'Fatura', color: '#10B981' }, // Emerald
  { value: 'contract', label: 'Contrato', color: '#F59E0B' }, // Amber
  { value: 'meeting', label: 'Reunião', color: '#8B5CF6' }, // Violet
  { value: 'deadline', label: 'Prazo', color: '#EF4444' }, // Red
  { value: 'follow-up', label: 'Follow-up', color: '#3B82F6' }, // Blue
  { value: 'personal', label: 'Pessoal', color: '#EC4899' }, // Pink
];

export const REMINDER_PRIORITIES: { value: ReminderPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Baixa', color: '#6B7280' }, // Gray
  { value: 'medium', label: 'Média', color: '#3B82F6' }, // Blue
  { value: 'high', label: 'Alta', color: '#F59E0B' }, // Amber
  { value: 'urgent', label: 'Urgente', color: '#EF4444' }, // Red
];

export const REMINDER_RECURRENCES: { value: ReminderRecurrence; label: string }[] = [
  { value: 'none', label: 'Não se repete' },
  { value: 'daily', label: 'Diariamente' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'monthly', label: 'Mensalmente' },
  { value: 'yearly', label: 'Anualmente' },
];

export const NOTIFICATION_TIMES: { value: number; label: string }[] = [
  { value: 0, label: 'No momento' },
  { value: 5, label: '5 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 120, label: '2 horas antes' },
  { value: 1440, label: '1 dia antes' },
  { value: 2880, label: '2 dias antes' },
  { value: 10080, label: '1 semana antes' },
];

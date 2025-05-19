import { ReminderRecurrence } from '@/types/reminder';
import { addDays, addMonths, addWeeks, addYears, isAfter } from 'date-fns';

/**
 * Calcula a próxima data de ocorrência para um lembrete recorrente
 * @param currentDate Data atual do lembrete
 * @param recurrence Tipo de recorrência
 * @param recurrenceEndDate Data de término da recorrência (opcional)
 * @returns A próxima data de ocorrência ou null se não houver próxima ocorrência
 */
export function getNextOccurrenceDate(
  currentDate: Date,
  recurrence: ReminderRecurrence | null,
  recurrenceEndDate: Date | null = null
): Date | null {
  if (!recurrence || recurrence === 'none') {
    return null;
  }

  let nextDate: Date;

  // Calcular a próxima data com base no tipo de recorrência
  switch (recurrence) {
    case 'daily':
      nextDate = addDays(currentDate, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(currentDate, 1);
      break;
    case 'monthly':
      nextDate = addMonths(currentDate, 1);
      break;
    case 'yearly':
      nextDate = addYears(currentDate, 1);
      break;
    default:
      return null;
  }

  // Verificar se a próxima data está além da data de término
  if (recurrenceEndDate && isAfter(nextDate, recurrenceEndDate)) {
    return null;
  }

  return nextDate;
}

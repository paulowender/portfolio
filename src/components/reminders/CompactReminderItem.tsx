'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { Reminder, REMINDER_CATEGORIES, REMINDER_PRIORITIES } from '@/types/reminder';
import { useCompleteReminder, useToggleReminder } from '@/hooks/useReminderQuery';
import { Badge } from '@/components/ui/badge';

interface CompactReminderItemProps {
  reminder: Reminder;
  index: number;
}

export default function CompactReminderItem({ reminder, index }: CompactReminderItemProps) {
  const toggleReminder = useToggleReminder();
  const completeReminder = useCompleteReminder();

  const categoryInfo =
    REMINDER_CATEGORIES.find((cat) => cat.value === reminder.category) || REMINDER_CATEGORIES[0];
  const priorityInfo =
    REMINDER_PRIORITIES.find((pri) => pri.value === reminder.priority) || REMINDER_PRIORITIES[1];

  const isOverdue = !reminder.completed && new Date(reminder.dueDate) < new Date();
  const isRecurring = reminder.recurrence && reminder.recurrence !== 'none';

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!reminder.completed && isRecurring) {
      // Se for um lembrete recorrente não concluído, use a API de conclusão com recorrência
      completeReminder.mutate(reminder.id);
    } else {
      // Caso contrário, use a API de toggle normal
      toggleReminder.mutate(reminder.id);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className={`bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 mb-2 border ${reminder.completed
          ? 'border-gray-700 opacity-75'
          : isOverdue
            ? 'border-red-700'
            : 'border-gray-700'
          } transition-colors`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            className="mt-0.5 flex-shrink-0 focus:outline-none"
            aria-label={reminder.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {reminder.completed ? (
              <CheckCircleSolidIcon className="h-5 w-5 text-green-500" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3
                className={`font-medium truncate ${reminder.completed ? 'line-through text-gray-400' : ''
                  }`}
              >
                {reminder.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center mt-1 gap-2">
              <span
                className={`text-xs ${isOverdue && !reminder.completed ? 'text-red-400' : 'text-gray-400'}`}
              >
                {format(new Date(reminder.dueDate), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>

            <div className="flex flex-wrap items-center mt-1 gap-2">
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: priorityInfo.color,
                  color: priorityInfo.color,
                }}
              >
                {priorityInfo.label}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: categoryInfo.color,
                  color: categoryInfo.color,
                }}
              >
                {categoryInfo.label}
              </Badge>

              {isRecurring && (
                <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                  Recorrente
                </Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { Reminder, REMINDER_CATEGORIES, REMINDER_PRIORITIES } from '@/types/reminder';
import {
  useToggleReminder,
  useDeleteReminder,
  useSendReminderNotification,
} from '@/hooks/useReminderQuery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ReminderItemProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
}

export default function ReminderItem({ reminder, onEdit }: ReminderItemProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleReminder = useToggleReminder();
  const deleteReminder = useDeleteReminder();
  const sendNotification = useSendReminderNotification();

  const categoryInfo =
    REMINDER_CATEGORIES.find((cat) => cat.value === reminder.category) || REMINDER_CATEGORIES[0];
  const priorityInfo =
    REMINDER_PRIORITIES.find((pri) => pri.value === reminder.priority) || REMINDER_PRIORITIES[1];

  const isOverdue = !reminder.completed && new Date(reminder.dueDate) < new Date();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleReminder.mutate(reminder.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(reminder);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteReminder.mutate(reminder.id);
  };

  const handleSendNotification = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendNotification.mutate(reminder.id, {
      onSuccess: (data) => {
        if (data.emailSent || data.whatsappSent) {
          toast({
            title: 'Notificação enviada',
            description: `Notificação enviada com sucesso${data.emailSent ? ' por email' : ''}${
              data.whatsappSent ? ' por WhatsApp' : ''
            }.`,
          });
        } else {
          toast({
            title: 'Notificação não enviada',
            description: 'Nenhum canal de notificação está configurado ou ativo.',
            variant: 'destructive',
          });
        }
      },
      onError: () => {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao enviar a notificação.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`bg-gray-800 rounded-lg overflow-hidden mb-4 border ${
        reminder.completed
          ? 'border-gray-700 opacity-75'
          : isOverdue
            ? 'border-red-700'
            : 'border-gray-700'
      }`}
    >
      <div
        className={`p-4 cursor-pointer ${reminder.completed ? 'bg-gray-800/50' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <button
              onClick={handleToggle}
              className="mt-0.5 flex-shrink-0 focus:outline-none"
              aria-label={reminder.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {reminder.completed ? (
                <CheckCircleSolidIcon className="h-6 w-6 text-green-500" />
              ) : (
                <CheckCircleIcon className="h-6 w-6 text-gray-400 hover:text-green-500 transition-colors" />
              )}
            </button>

            <div>
              <h3
                className={`font-medium text-lg ${reminder.completed ? 'line-through text-gray-400' : 'text-white'}`}
              >
                {reminder.title}
              </h3>

              <div className="flex flex-wrap items-center mt-2 gap-2">
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

                <span
                  className={`text-xs ${isOverdue && !reminder.completed ? 'text-red-400' : 'text-gray-400'}`}
                >
                  {format(new Date(reminder.dueDate), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </span>

                {reminder.recurrence && reminder.recurrence !== 'none' && (
                  <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                    Recorrente
                  </Badge>
                )}

                <div className="flex space-x-1">
                  {reminder.notifyEmail && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-gray-400">
                            <EnvelopeIcon className="h-4 w-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Notificação por email</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {reminder.notifyWhatsapp && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-gray-400">
                            <PhoneIcon className="h-4 w-4" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Notificação por WhatsApp</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {(reminder.notifyEmail || reminder.notifyWhatsapp) && !reminder.completed && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSendNotification}
                      className="h-8 w-8 text-gray-400 hover:text-yellow-400"
                      disabled={sendNotification.isPending}
                    >
                      {sendNotification.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <BellIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enviar notificação agora</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="h-8 w-8 text-gray-400 hover:text-blue-400"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-400"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 border border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir lembrete</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este lembrete? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {isExpanded && reminder.description && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-4 pt-0 ml-9"
        >
          <div className="border-t border-gray-700 pt-3 mt-1 text-gray-300 whitespace-pre-line">
            {reminder.description}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

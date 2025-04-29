'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  Reminder,
  ReminderFormData,
  REMINDER_CATEGORIES,
  REMINDER_PRIORITIES,
  REMINDER_RECURRENCES,
  NOTIFICATION_TIMES,
} from '@/types/reminder';
import { useCreateReminder, useUpdateReminder } from '@/hooks/useReminderQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

// Schema for form validation
const reminderSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: 'A data de vencimento é obrigatória',
  }),
  dueTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  category: z.string(),
  priority: z.string(),
  recurrence: z.string().nullable(),
  recurrenceEndDate: z.date().nullable().optional(),
  notifyEmail: z.boolean().default(true),
  notifyWhatsapp: z.boolean().default(false),
  notifyBefore: z.number().int().default(60),
  color: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface ReminderFormProps {
  reminder?: Reminder;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderForm({ reminder, isOpen, onClose }: ReminderFormProps) {
  const { toast } = useToast();
  const createReminder = useCreateReminder();
  const updateReminder = reminder ? useUpdateReminder(reminder.id) : null;
  const isEditing = !!reminder;

  // Initialize form with default values or existing reminder values
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: reminder?.title || '',
      description: reminder?.description || '',
      dueDate: reminder?.dueDate ? new Date(reminder.dueDate) : new Date(),
      dueTime: reminder?.dueDate
        ? format(new Date(reminder.dueDate), 'HH:mm')
        : format(new Date(), 'HH:mm'),
      category: reminder?.category || 'general',
      priority: reminder?.priority || 'medium',
      recurrence: reminder?.recurrence || 'none',
      recurrenceEndDate: reminder?.recurrenceEndDate ? new Date(reminder.recurrenceEndDate) : null,
      notifyEmail: reminder?.notifyEmail ?? true,
      notifyWhatsapp: reminder?.notifyWhatsapp ?? false,
      notifyBefore: reminder?.notifyBefore ?? 60,
      color: reminder?.color || '',
    },
  });

  // Reset form when reminder changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: reminder?.title || '',
        description: reminder?.description || '',
        dueDate: reminder?.dueDate ? new Date(reminder.dueDate) : new Date(),
        dueTime: reminder?.dueDate
          ? format(new Date(reminder.dueDate), 'HH:mm')
          : format(new Date(), 'HH:mm'),
        category: reminder?.category || 'general',
        priority: reminder?.priority || 'medium',
        recurrence: reminder?.recurrence || 'none',
        recurrenceEndDate: reminder?.recurrenceEndDate
          ? new Date(reminder.recurrenceEndDate)
          : null,
        notifyEmail: reminder?.notifyEmail ?? true,
        notifyWhatsapp: reminder?.notifyWhatsapp ?? false,
        notifyBefore: reminder?.notifyBefore ?? 60,
        color: reminder?.color || '',
      });
    }
  }, [reminder, isOpen, form]);

  const onSubmit = async (data: ReminderFormValues) => {
    try {
      // Combine date and time
      const dueDateTime = new Date(data.dueDate);
      const [hours, minutes] = data.dueTime.split(':').map(Number);
      dueDateTime.setHours(hours, minutes);

      const reminderData: ReminderFormData = {
        title: data.title,
        description: data.description,
        dueDate: dueDateTime,
        category: data.category as any,
        priority: data.priority as any,
        recurrence: data.recurrence as any,
        recurrenceEndDate: data.recurrenceEndDate,
        notifyEmail: data.notifyEmail,
        notifyWhatsapp: data.notifyWhatsapp,
        notifyBefore: data.notifyBefore,
        color: data.color,
      };

      if (isEditing && updateReminder) {
        await updateReminder.mutateAsync(reminderData);
        toast({
          title: 'Lembrete atualizado',
          description: 'O lembrete foi atualizado com sucesso.',
        });
      } else {
        await createReminder.mutateAsync(reminderData);
        toast({
          title: 'Lembrete criado',
          description: 'O lembrete foi criado com sucesso.',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o lembrete. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const showRecurrenceEndDate =
    form.watch('recurrence') !== 'none' && form.watch('recurrence') !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-800 border border-gray-700 text-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lembrete' : 'Novo Lembrete'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="recurrence">Recorrência</TabsTrigger>
                <TabsTrigger value="notifications">Notificações</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título do lembrete" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição do lembrete (opcional)"
                          className="resize-none"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className="pl-3 text-left font-normal">
                                {field.value ? (
                                  format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-gray-800 border border-gray-700"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border border-gray-700">
                            {REMINDER_CATEGORIES.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                                className="flex items-center"
                              >
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  {category.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma prioridade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border border-gray-700">
                            {REMINDER_PRIORITIES.map((priority) => (
                              <SelectItem
                                key={priority.value}
                                value={priority.value}
                                className="flex items-center"
                              >
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: priority.color }}
                                  />
                                  {priority.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="recurrence" className="space-y-4">
                <FormField
                  control={form.control}
                  name="recurrence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recorrência</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma recorrência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border border-gray-700">
                          {REMINDER_RECURRENCES.map((recurrence) => (
                            <SelectItem key={recurrence.value} value={recurrence.value}>
                              {recurrence.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Defina se este lembrete deve se repetir periodicamente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showRecurrenceEndDate && (
                  <FormField
                    control={form.control}
                    name="recurrenceEndDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de término da recorrência</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className="pl-3 text-left font-normal">
                                {field.value ? (
                                  format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                ) : (
                                  <span>Sem data de término</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-gray-800 border border-gray-700"
                            align="start"
                          >
                            <div className="p-2">
                              <Button
                                variant="ghost"
                                className="text-sm mb-2"
                                onClick={() => form.setValue('recurrenceEndDate', null)}
                              >
                                <XMarkIcon className="h-4 w-4 mr-1" />
                                Limpar data
                              </Button>
                            </div>
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(form.getValues('dueDate'))}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Opcional. Se não definida, o lembrete se repetirá indefinidamente.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <FormField
                  control={form.control}
                  name="notifyBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notificar com antecedência</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione quando notificar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border border-gray-700">
                          {NOTIFICATION_TIMES.map((time) => (
                            <SelectItem key={time.value} value={time.value.toString()}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Quando você deseja receber a notificação antes do prazo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notifyEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Notificação por Email</FormLabel>
                          <FormDescription>Receba lembretes por email.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notifyWhatsapp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Notificação por WhatsApp</FormLabel>
                          <FormDescription>
                            Receba lembretes por WhatsApp (requer configuração da Evolution API).
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createReminder.isPending || (updateReminder?.isPending ?? false)}
              >
                {createReminder.isPending || (updateReminder?.isPending ?? false) ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Salvando...
                  </span>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Tailwind,
} from '@react-email/components';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReminderCategory, ReminderPriority, REMINDER_CATEGORIES, REMINDER_PRIORITIES } from '@/types/reminder';

interface ReminderNotificationEmailProps {
  userName: string;
  reminderTitle: string;
  reminderDescription: string;
  dueDate: Date;
  category: string;
  priority: string;
}

export default function ReminderNotificationEmail({
  userName,
  reminderTitle,
  reminderDescription,
  dueDate,
  category,
  priority,
}: ReminderNotificationEmailProps) {
  const categoryInfo = REMINDER_CATEGORIES.find(cat => cat.value === category as ReminderCategory) || REMINDER_CATEGORIES[0];
  const priorityInfo = REMINDER_PRIORITIES.find(pri => pri.value === priority as ReminderPriority) || REMINDER_PRIORITIES[1];
  
  const formattedDate = format(dueDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  
  return (
    <Html>
      <Head />
      <Preview>Lembrete: {reminderTitle}</Preview>
      <Tailwind>
        <Body className="bg-[#08090D] font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-xl border border-solid border-[#2A2932] bg-[#0C0D12] p-8">
            <Heading className="mb-2 text-2xl font-bold text-[#F3F1F8]">Olá, {userName}!</Heading>
            <Text className="mb-6 text-[#AAA6B4]">
              Este é um lembrete para um evento importante:
            </Text>
            
            <Section className="mb-6 rounded-xl border border-solid border-[#2A2932] bg-[#14151A] p-6">
              <Heading className="mb-2 text-xl font-bold text-[#F3F1F8]">{reminderTitle}</Heading>
              
              {reminderDescription && (
                <Text className="mb-4 whitespace-pre-line text-[#AAA6B4]">{reminderDescription}</Text>
              )}
              
              <Text className="mb-1 text-[#AAA6B4]">
                <strong>Data:</strong> {formattedDate}
              </Text>
              
              <Text className="mb-1 text-[#AAA6B4]">
                <strong>Categoria:</strong> {categoryInfo.label}
              </Text>
              
              <Text className="text-[#AAA6B4]">
                <strong>Prioridade:</strong> {priorityInfo.label}
              </Text>
            </Section>
            
            <Hr className="my-6 border-[#2A2932]" />
            
            <Text className="text-center text-sm text-[#77727F]">
              Este é um email automático. Por favor, não responda a este email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

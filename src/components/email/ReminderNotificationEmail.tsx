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
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-8 rounded-lg shadow-lg my-8 mx-auto max-w-xl">
            <Heading className="text-2xl font-bold text-gray-800 mb-2">Olá, {userName}!</Heading>
            <Text className="text-gray-600 mb-6">
              Este é um lembrete para um evento importante:
            </Text>
            
            <Section className="bg-gray-50 p-6 rounded-lg border-l-4 mb-6" style={{ borderColor: priorityInfo.color }}>
              <Heading className="text-xl font-bold text-gray-800 mb-2">{reminderTitle}</Heading>
              
              {reminderDescription && (
                <Text className="text-gray-700 mb-4 whitespace-pre-line">{reminderDescription}</Text>
              )}
              
              <Text className="text-gray-700 mb-1">
                <strong>Data:</strong> {formattedDate}
              </Text>
              
              <Text className="text-gray-700 mb-1">
                <strong>Categoria:</strong> {categoryInfo.label}
              </Text>
              
              <Text className="text-gray-700">
                <strong>Prioridade:</strong> {priorityInfo.label}
              </Text>
            </Section>
            
            <Hr className="border-gray-200 my-6" />
            
            <Text className="text-gray-500 text-sm text-center">
              Este é um email automático. Por favor, não responda a este email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

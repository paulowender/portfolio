import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import axios from 'axios';
import * as React from 'react';
import { getAuthenticatedClient } from '@/lib/auth-helper';
import ReminderNotificationEmail from '@/components/email/ReminderNotificationEmail';

export async function POST(request: Request) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { reminderId } = body;

    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }

    // Get reminder from the database
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Check if the reminder belongs to the authenticated user
    if (reminder.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot access reminder of another user' },
        { status: 403 },
      );
    }

    // Get user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        company: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    // Get messaging configuration
    const messagingConfig = await prisma.messagingConfig.findUnique({
      where: { userId: user.id },
    });

    if (!messagingConfig) {
      return NextResponse.json({ error: 'Messaging configuration not found' }, { status: 404 });
    }

    let emailSent = false;
    let whatsappSent = false;

    // Send email notification if enabled
    if (reminder.notifyEmail && messagingConfig.resendEnabled && messagingConfig.resendApiKey) {
      try {
        // Initialize Resend client
        const resend = new Resend(messagingConfig.resendApiKey);

        // Company information
        const companyName = userData.company?.name || 'Wender Tech';
        const fromEmail = messagingConfig.resendFromEmail || '';
        const fromName = messagingConfig.resendFromName || companyName;
        const userEmail = userData.email;

        // Send email notification
        const { data, error: emailError } = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [userEmail],
          subject: `Lembrete: ${reminder.title}`,
          react: ReminderNotificationEmail({
            userName: userData.name,
            reminderTitle: reminder.title,
            reminderDescription: reminder.description || '',
            dueDate: new Date(reminder.dueDate),
            category: reminder.category,
            priority: reminder.priority,
          }) as React.ReactElement,
        });

        if (emailError) {
          console.error('Error sending email notification:', emailError);
        } else {
          emailSent = true;
        }
      } catch (emailError) {
        console.error('Exception sending email notification:', emailError);
      }
    }

    // Send WhatsApp notification if enabled
    if (
      reminder.notifyWhatsapp &&
      messagingConfig.evolutionEnabled &&
      messagingConfig.evolutionApiKey &&
      messagingConfig.evolutionBaseUrl &&
      messagingConfig.evolutionInstance
    ) {
      try {
        // Format the message for WhatsApp
        const dueDate = new Date(reminder.dueDate);
        const formattedDate = dueDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        const formattedTime = dueDate.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const whatsappMessage = `*Lembrete: ${reminder.title}*\n\n${
          reminder.description ? `${reminder.description}\n\n` : ''
        }*Data:* ${formattedDate} às ${formattedTime}\n*Categoria:* ${reminder.category}\n*Prioridade:* ${reminder.priority}`;

        // Get the user phone number (remove any non-numeric characters)
        const userPhone = userData.phone || userData.company?.phone || '';
        const cleanUserPhone = userPhone.replace(/\D/g, '');

        if (cleanUserPhone) {
          // Send message via Evolution API
          const response = await axios.post(
            `${messagingConfig.evolutionBaseUrl}/message/sendText/${messagingConfig.evolutionInstance}`,
            {
              number: cleanUserPhone,
              delay: 1200,
              text: whatsappMessage,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                apikey: messagingConfig.evolutionApiKey,
              },
            },
          );

          if (response.status === 201 || response.status === 200) {
            whatsappSent = true;
          }
        } else {
          console.warn('No user phone number found for WhatsApp notification');
        }
      } catch (whatsappError) {
        console.error('Error sending WhatsApp notification:', whatsappError);
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      whatsappSent,
    });
  } catch (error: any) {
    console.error('Exception in POST /api/reminders/notify:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

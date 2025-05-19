import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/auth-helper';
import { getReminder, updateReminder, createReminder } from '@/lib/db';
import { getNextOccurrenceDate } from '@/lib/reminder-utils';
import { Reminder } from '@/types/reminder';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    const reminderId = (await params).id;

    // Get reminder from the database
    const { data: existingReminder, error: getError } = await getReminder(reminderId);

    if (getError) {
      return NextResponse.json(
        { error: getError instanceof Error ? getError.message : 'Failed to fetch reminder' },
        { status: 500 }
      );
    }

    if (!existingReminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Check if the reminder belongs to the authenticated user
    if (existingReminder.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot update reminder of another user' },
        { status: 403 },
      );
    }

    // Mark the current reminder as completed
    const { data: updatedReminder, error: updateError } = await updateReminder(reminderId, {
      completed: true,
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError instanceof Error ? updateError.message : 'Failed to complete reminder' },
        { status: 500 }
      );
    }

    let newReminder: Reminder | null = null;

    // If the reminder is recurring, create a new reminder for the next occurrence
    if (existingReminder.recurrence && existingReminder.recurrence !== 'none') {
      const nextDate = getNextOccurrenceDate(
        new Date(existingReminder.dueDate),
        existingReminder.recurrence as any,
        existingReminder.recurrenceEndDate ? new Date(existingReminder.recurrenceEndDate) : null
      );

      if (nextDate) {
        // Create a new reminder for the next occurrence
        try {
          const result = await prisma.reminder.create({
            data: {
              title: existingReminder.title,
              description: existingReminder.description,
              dueDate: nextDate,
              completed: false,
              category: existingReminder.category,
              priority: existingReminder.priority,
              recurrence: existingReminder.recurrence,
              recurrenceEndDate: existingReminder.recurrenceEndDate,
              notifyEmail: existingReminder.notifyEmail,
              notifyWhatsapp: existingReminder.notifyWhatsapp,
              notifyBefore: existingReminder.notifyBefore,
              color: existingReminder.color,
              userId: existingReminder.userId,
            },
          });
          
          newReminder = result as Reminder;
        } catch (error) {
          console.error('Error creating next occurrence reminder:', error);
          // Continue even if creating the next occurrence fails
        }
      }
    }

    return NextResponse.json({ 
      reminder: updatedReminder,
      nextOccurrence: newReminder
    });
  } catch (error: any) {
    console.error(`Exception in POST /api/reminders/${(await params).id}/complete:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

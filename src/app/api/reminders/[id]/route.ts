import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedClient } from '@/lib/auth-helper';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    return NextResponse.json({ reminder });
  } catch (error: any) {
    console.error(`Exception in GET /api/reminders/${(await params).id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const existingReminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

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

    // Parse the request body
    const body = await request.json();
    const {
      title,
      description,
      dueDate,
      completed,
      category,
      priority,
      recurrence,
      recurrenceEndDate,
      notifyEmail,
      notifyWhatsapp,
      notifyBefore,
      color,
    } = body;

    // Update reminder in the database
    const reminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        dueDate: dueDate !== undefined ? new Date(dueDate) : undefined,
        completed: completed !== undefined ? completed : undefined,
        category: category !== undefined ? category : undefined,
        priority: priority !== undefined ? priority : undefined,
        recurrence: recurrence !== undefined ? recurrence : undefined,
        recurrenceEndDate: recurrenceEndDate !== undefined 
          ? recurrenceEndDate 
            ? new Date(recurrenceEndDate) 
            : null 
          : undefined,
        notifyEmail: notifyEmail !== undefined ? notifyEmail : undefined,
        notifyWhatsapp: notifyWhatsapp !== undefined ? notifyWhatsapp : undefined,
        notifyBefore: notifyBefore !== undefined ? notifyBefore : undefined,
        color: color !== undefined ? color : undefined,
      },
    });

    return NextResponse.json({ reminder });
  } catch (error: any) {
    console.error(`Exception in PUT /api/reminders/${(await params).id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const existingReminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!existingReminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Check if the reminder belongs to the authenticated user
    if (existingReminder.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot delete reminder of another user' },
        { status: 403 },
      );
    }

    // Delete reminder from the database
    await prisma.reminder.delete({
      where: { id: reminderId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Exception in DELETE /api/reminders/${(await params).id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

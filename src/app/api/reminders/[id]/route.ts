import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/auth-helper';
import { getReminder, updateReminder, deleteReminder } from '@/lib/db';

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
    const { data: reminder, error: dbError } = await getReminder(reminderId);

    if (dbError) {
      return NextResponse.json(
        { error: dbError instanceof Error ? dbError.message : 'Failed to fetch reminder' },
        { status: 500 }
      );
    }

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
    const { data: reminder, error: updateError } = await updateReminder(reminderId, {
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
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError instanceof Error ? updateError.message : 'Failed to update reminder' },
        { status: 500 }
      );
    }

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
        { error: 'Unauthorized: Cannot delete reminder of another user' },
        { status: 403 },
      );
    }

    // Delete reminder from the database
    const { error: deleteError } = await deleteReminder(reminderId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError instanceof Error ? deleteError.message : 'Failed to delete reminder' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Exception in DELETE /api/reminders/${(await params).id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

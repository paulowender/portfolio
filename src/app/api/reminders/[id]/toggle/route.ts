import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/auth-helper';
import { getReminder, updateReminder } from '@/lib/db';

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

    // Toggle the completed status
    const { data: reminder, error: updateError } = await updateReminder(reminderId, {
      completed: !existingReminder.completed,
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError instanceof Error ? updateError.message : 'Failed to toggle reminder' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reminder });
  } catch (error: any) {
    console.error(`Exception in POST /api/reminders/${(await params).id}/toggle:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

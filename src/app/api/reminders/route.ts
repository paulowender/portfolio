import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/auth-helper';
import { createReminder, getReminders } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const priority = url.searchParams.get('priority');
    const completed = url.searchParams.get('completed');
    const upcoming = url.searchParams.get('upcoming') === 'true';
    const search = url.searchParams.get('search');

    // Build filter conditions
    const where: any = {
      userId: user.id,
    };

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    if (completed !== null) {
      where.completed = completed === 'true';
    }

    if (upcoming) {
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      where.dueDate = {
        gte: now,
        lte: nextWeek,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Use the authenticated user's ID
    const effectiveUserId = user.id;
    console.log('Fetching reminders for user:', effectiveUserId);

    const { data: reminders, error: dbError } = await getReminders(effectiveUserId);

    if (dbError) {
      return NextResponse.json(
        { error: dbError instanceof Error ? dbError.message : 'Failed to fetch reminders' },
        { status: 500 },
      );
    }

    return NextResponse.json({ reminders });
  } catch (error: any) {
    console.error('Exception in GET /api/reminders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const {
      title,
      description,
      dueDate,
      category,
      priority,
      recurrence,
      recurrenceEndDate,
      notifyEmail,
      notifyWhatsapp,
      notifyBefore,
      color,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!dueDate) {
      return NextResponse.json({ error: 'Due date is required' }, { status: 400 });
    }

    // Create reminder in the database
    const { data: reminder, error: createError } = await createReminder({
      title,
      description,
      dueDate: new Date(dueDate),
      completed: false,
      // Adicionando campos um por um para identificar o problema
      category: category || 'general',
      priority: priority || 'medium',
      recurrence,
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
      notifyEmail: notifyEmail !== undefined ? notifyEmail : true,
      notifyWhatsapp: notifyWhatsapp !== undefined ? notifyWhatsapp : false,
      notifyBefore: notifyBefore !== undefined ? notifyBefore : 60,
      color,
      user: { connect: { id: user.id } },
    });

    if (createError) {
      return NextResponse.json(
        { error: createError instanceof Error ? createError.message : 'Failed to create reminder' },
        { status: 500 },
      );
    }

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error: any) {
    console.error('Exception in POST /api/reminders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

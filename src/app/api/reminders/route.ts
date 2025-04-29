import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedClient } from '@/lib/auth-helper';

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

    // Get reminders from the database
    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { priority: 'desc' },
      ],
    });

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
    const reminder = await prisma.reminder.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        category: category || 'general',
        priority: priority || 'medium',
        recurrence,
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        notifyEmail: notifyEmail !== undefined ? notifyEmail : true,
        notifyWhatsapp: notifyWhatsapp !== undefined ? notifyWhatsapp : false,
        notifyBefore: notifyBefore !== undefined ? notifyBefore : 60,
        color,
        userId: user.id,
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error: any) {
    console.error('Exception in POST /api/reminders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

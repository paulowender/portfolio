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

    const userId = (await params).id;

    // If userId is provided, make sure it matches the authenticated user
    if (!user || (userId && userId !== user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot access profile of another user' },
        { status: 403 },
      );
    }

    // Get the user profile from the database
    const profile = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Exception in GET /api/profile/[id]:', error);
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

    const userId = (await params).id;

    // If userId is provided, make sure it matches the authenticated user
    if (!user || (userId && userId !== user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot update profile of another user' },
        { status: 403 },
      );
    }

    // Parse the request body
    const body = await request.json();

    // Update the user profile in the database
    const profile = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        title: body.title,
        bio: body.bio,
        location: body.location,
        phone: body.phone,
        website: body.website,
        linkedin: body.linkedin,
        github: body.github,
        twitter: body.twitter,
        skills: body.skills || [],
        avatarUrl: body.avatarUrl,
      },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Exception in PUT /api/profile/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

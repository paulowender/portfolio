import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Helper function to get authenticated Supabase client
async function getAuthenticatedClient(request: Request) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { client: null, error: 'Missing or invalid authorization header' };
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  // Create a new Supabase client with the token
  const supabaseWithAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );

  // Get the authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabaseWithAuth.auth.getUser();

  if (authError || !user) {
    return {
      client: null,
      error: authError?.message || 'No user found',
      status: 401,
    };
  }

  return { client: supabaseWithAuth, user, error: null };
}

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const userId = params.id;

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

import { NextResponse } from 'next/server';
import { getProject, updateProject, deleteProject } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

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
    const id = (await params).id;
    const { data, error } = await getProject(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const { client, user, error, status } = await getAuthenticatedClient(request);

    if (!user || !client) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const id = (await params).id;
    const body = await request.json();

    // Verify project ownership (optional extra security)
    const { data: project, error: fetchError } = await getProject(id);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this project' },
        { status: 403 },
      );
    }

    const { data, error: updateError } = await updateProject(id, body);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const { client, user, error, status } = await getAuthenticatedClient(request);
    if (!user || !client) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const id = (await params).id;

    // Verify project ownership (optional extra security)
    const { data: project, error: fetchError } = await getProject(id);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this project' },
        { status: 403 },
      );
    }

    const { error: deleteError } = await deleteProject(id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

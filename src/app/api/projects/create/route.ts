import { NextResponse } from 'next/server';
import { createProject } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
// import { supabase } from '@/lib/supabase'; // Not needed anymore

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 },
      );
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
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: authError?.message || 'No user found',
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Make sure the user_id matches the authenticated user
    if (body.user && body.user.connect && body.user.connect.id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot create project for another user' },
        { status: 403 },
      );
    }

    const { data, error } = await createProject(body);

    if (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create project' },
        { status: 500 },
      );
    }

    return NextResponse.json({ project: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

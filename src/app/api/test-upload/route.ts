import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
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

    // List files in the user's folder
    const { data: files, error: listError } = await supabaseWithAuth.storage
      .from('portfolio')
      .list(`${user.id}/project-images`);

    // Check if the folder exists
    const folderExists = !listError || listError.message !== 'The resource was not found';

    // Get storage bucket info
    const { data: buckets, error: bucketsError } = await supabaseWithAuth.storage.listBuckets();

    // Get RLS policies for storage
    const { data: policies, error: policiesError } = await supabaseWithAuth.rpc(
      'get_policies_for_object',
      {
        bucket_name: 'portfolio',
      },
    );

    return NextResponse.json({
      message: 'Storage test',
      user: {
        id: user.id,
        email: user.email,
      },
      storage: {
        buckets: buckets || [],
        bucketsError: bucketsError?.message,
        folderExists,
        files: files || [],
        listError: listError?.message,
      },
      policies: policies || [],
      policiesError: policiesError?.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

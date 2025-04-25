import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/db';
import { getAuthenticatedClient } from '@/lib/auth-helper';

export async function GET(request: Request) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If userId is provided, make sure it matches the authenticated user
    if (!user || (userId && userId !== user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot access projects of another user' },
        { status: 403 },
      );
    }

    // Use the authenticated user's ID if no userId is provided
    const effectiveUserId = userId || user.id;
    console.log('Fetching projects for user:', effectiveUserId);

    const { data, error: dbError } = await getProjects(effectiveUserId);

    if (dbError) {
      console.error('Error fetching projects:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    console.log(`Found ${data?.length || 0} projects for user ${effectiveUserId}`);
    return NextResponse.json({ projects: data });
  } catch (error: any) {
    console.error('Exception in GET /api/projects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

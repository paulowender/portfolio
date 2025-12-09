import { NextResponse } from 'next/server';
import { getProjects, getUserById } from '@/lib/db';

export async function GET(request: Request) {
  // Define CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Allow any origin
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Default to the main user if your system has a concept of a "main" user, 
    // or rely on fetching featured projects if userId is not provided (lib/db implementation dependent)
    
    // For this specific use case (portfolio signature), we want to fetch projects for the portfolio owner.
    // If userId is provided, usage is specific.
    // If NOT provided, `getProjects` in `lib/db.ts` fetches featured projects if userId is undefined?
    // Let's check `lib/db.ts`: "const where = userId ? { userId } : { featured: true };"
    
    const { data: projects, error } = await getProjects(userId || undefined);

    if (error) {
      console.error('Error fetching projects for public API:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // Also fetch user info if available to provide context (optional but good for the badge)
    let userData = null;
    if (userId) {
       const { data: user } = await getUserById(userId);
       if (user) {
           userData = {
               name: user.name,
               avatarUrl: user.avatarUrl,
               website: user.website
           }
       }
    }

    return NextResponse.json({ 
        projects,
        user: userData 
    }, { 
        status: 200, 
        headers: corsHeaders 
    });

  } catch (error: any) {
    console.error('Exception in public API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: Request) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

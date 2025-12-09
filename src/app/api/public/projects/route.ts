import { NextResponse } from 'next/server';
import { getProjects, getUserById } from '@/lib/db';

export async function GET(request: Request) {
  // Define CORS headers consistently
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const { data: projects, error } = await getProjects(userId || undefined);

    if (error) {
      console.error('Error fetching projects for public API:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500, headers: corsHeaders }
      );
    }
    
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
}

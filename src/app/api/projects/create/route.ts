import { NextResponse } from 'next/server';
import { createProject } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Make sure the user_id matches the authenticated user
    if (body.user && body.user.connect && body.user.connect.id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized: Cannot create project for another user' }, { status: 403 });
    }
    
    const { data, error } = await createProject(body);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ project: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

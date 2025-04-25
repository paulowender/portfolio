import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

// Helper function to get authenticated Supabase client
async function getAuthenticatedClient(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Tentar obter o cookie de sessão como fallback
      const cookies = request.headers.get('cookie');
      if (!cookies) {
        return { client: null, error: 'Missing or invalid authorization header', status: 401 };
      }

      // Criar cliente Supabase padrão
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      );

      // Tentar obter a sessão atual
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        return { client: null, error: 'No valid session found', status: 401 };
      }

      // Usar o token da sessão
      const token = sessionData.session.access_token;

      // Criar cliente autenticado com o token da sessão
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

      // Obter o usuário autenticado
      const {
        data: { user },
        error: userError,
      } = await supabaseWithAuth.auth.getUser();

      if (userError || !user) {
        return { client: null, error: userError?.message || 'No user found', status: 401 };
      }

      return { client: supabaseWithAuth, user, error: null };
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
  } catch (error: any) {
    console.error('Authentication error:', error);
    return { client: null, error: error.message || 'Authentication error', status: 500 };
  }
}

// Get Evolution API configuration
async function getEvolutionConfig(userId: string) {
  const config = await prisma.messagingConfig.findUnique({
    where: { userId },
  });

  if (!config || !config.evolutionApiKey || !config.evolutionBaseUrl || !config.evolutionEnabled) {
    throw new Error('Evolution API not configured or enabled');
  }

  return {
    apiKey: config.evolutionApiKey,
    baseUrl: config.evolutionBaseUrl,
  };
}

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

    // Get Evolution API configuration
    const { apiKey, baseUrl } = await getEvolutionConfig(user.id);

    // Fetch instances from Evolution API
    try {
      const response = await axios.get(`${baseUrl}/instance/fetchInstances`, {
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
      });

      if (response.status !== 200) {
        return NextResponse.json(
          { error: 'Failed to fetch instances from Evolution API' },
          { status: 400 },
        );
      }

      // Format instances
      const instances = response.data.map((instance: any) => ({
        id: instance.name,
        name: instance.profileName || instance.name,
        picture: instance.profilePicUrl || '',
        status: instance.connectionStatus === 'open' ? 'connected' : 'disconnected',
        number: instance.number || '',
      }));

      return NextResponse.json({ instances });
    } catch (err: any) {
      console.error('Error fetching instances from Evolution API:', err);
      return NextResponse.json(
        { error: err.response?.data?.message || 'Failed to fetch instances' },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error('Exception in GET /api/evolution/instances:', error);
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
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Instance name is required' }, { status: 400 });
    }

    // Get Evolution API configuration
    const { apiKey, baseUrl } = await getEvolutionConfig(user.id);

    // Create instance in Evolution API
    try {
      const response = await axios.post(
        `${baseUrl}/instance/create`,
        {
          instanceName: name,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            apikey: apiKey,
          },
        },
      );

      if (response.status !== 201) {
        return NextResponse.json(
          { error: 'Failed to create instance in Evolution API' },
          { status: 400 },
        );
      }

      return NextResponse.json({ success: true, instance: response.data });
    } catch (err: any) {
      console.error('Error creating instance in Evolution API:', err);
      return NextResponse.json(
        { error: err.response?.data?.message || 'Failed to create instance' },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error('Exception in POST /api/evolution/instances:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

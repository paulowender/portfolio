import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

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
    const { apiKey, baseUrl, isEnabled } = body;

    if (!apiKey || !baseUrl) {
      return NextResponse.json({ error: 'API Key and Base URL are required' }, { status: 400 });
    }

    // Check if Messaging configuration exists
    let config = await prisma.messagingConfig.findUnique({
      where: { userId: user.id },
    });

    if (config) {
      // Update existing configuration
      config = await prisma.messagingConfig.update({
        where: { userId: user.id },
        data: {
          evolutionApiKey: apiKey,
          evolutionBaseUrl: baseUrl,
          evolutionEnabled: isEnabled,
        },
      });
    } else {
      // Create new configuration
      config = await prisma.messagingConfig.create({
        data: {
          userId: user.id,
          evolutionApiKey: apiKey,
          evolutionBaseUrl: baseUrl,
          evolutionEnabled: isEnabled,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Exception in POST /api/evolution/config:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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

    // Get the Messaging configuration from the database
    const config = await prisma.messagingConfig.findUnique({
      where: { userId: user.id },
    });

    if (!config) {
      return NextResponse.json({
        config: {
          apiKey: '',
          baseUrl: '',
          isEnabled: false,
        },
      });
    }

    return NextResponse.json({
      config: {
        apiKey: config.evolutionApiKey || '',
        baseUrl: config.evolutionBaseUrl || '',
        isEnabled: config.evolutionEnabled || false,
      },
    });
  } catch (error: any) {
    console.error('Exception in GET /api/evolution/config:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

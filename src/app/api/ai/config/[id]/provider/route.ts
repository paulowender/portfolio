import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { AIProvider } from '@/types/ai';

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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
        { error: 'Unauthorized: Cannot update AI configuration of another user' },
        { status: 403 },
      );
    }

    // Parse the request body
    const body = await request.json();
    const { provider, apiKey, isEnabled } = body;

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 });
    }

    // Validate provider
    if (!['openai', 'anthropic', 'groq', 'openrouter'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Check if AI configuration exists
    let config = await prisma.aIConfig.findUnique({
      where: { userId },
    });

    // Prepare update data based on provider
    const updateData: any = {};

    switch (provider as AIProvider) {
      case 'openai':
        updateData.openaiApiKey = apiKey;
        updateData.openaiEnabled = isEnabled;
        break;
      case 'anthropic':
        updateData.anthropicApiKey = apiKey;
        updateData.anthropicEnabled = isEnabled;
        break;
      case 'groq':
        updateData.groqApiKey = apiKey;
        updateData.groqEnabled = isEnabled;
        break;
      case 'openrouter':
        updateData.openrouterApiKey = apiKey;
        updateData.openrouterEnabled = isEnabled;
        break;
    }

    // If this is the first enabled provider, set it as default
    if (isEnabled && (!config || !config.defaultProvider)) {
      updateData.defaultProvider = provider;
    }

    if (config) {
      // Update existing configuration
      config = await prisma.aIConfig.update({
        where: { userId },
        data: updateData,
      });
    } else {
      // Create new configuration
      config = await prisma.aIConfig.create({
        data: {
          userId,
          defaultProvider: isEnabled ? provider : 'openai',
          ...updateData,
        },
      });
    }

    return NextResponse.json({ success: true, provider });
  } catch (error: any) {
    console.error('Exception in POST /api/ai/config/[id]/provider:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

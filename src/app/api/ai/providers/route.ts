import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { AI_PROVIDERS } from '@/types/ai';

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
      const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
      
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

export async function GET(request: Request) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: User not found' },
        { status: 401 },
      );
    }

    // Get the AI configuration from the database
    const config = await prisma.aIConfig.findUnique({
      where: { userId: user.id },
    });

    if (!config) {
      return NextResponse.json({
        providers: [],
      });
    }

    // Create a list of configured providers
    const providers = [];

    // Check OpenAI configuration
    if (config.openaiApiKey) {
      providers.push({
        provider: 'openai',
        isEnabled: config.openaiEnabled,
        apiKey: config.openaiApiKey,
        model: config.openaiModel || 'gpt-3.5-turbo',
      });
    }

    // Check Anthropic configuration
    if (config.anthropicApiKey) {
      providers.push({
        provider: 'anthropic',
        isEnabled: config.anthropicEnabled,
        apiKey: config.anthropicApiKey,
        model: config.anthropicModel || 'claude-3-haiku-20240307',
      });
    }

    // Check Groq configuration
    if (config.groqApiKey) {
      providers.push({
        provider: 'groq',
        isEnabled: config.groqEnabled,
        apiKey: config.groqApiKey,
        model: config.groqModel || 'llama3-8b-8192',
      });
    }

    // Check OpenRouter configuration
    if (config.openrouterApiKey) {
      providers.push({
        provider: 'openrouter',
        isEnabled: config.openrouterEnabled,
        apiKey: config.openrouterApiKey,
        model: config.openrouterModel || 'openai/gpt-3.5-turbo',
      });
    }

    return NextResponse.json({
      providers,
    });
  } catch (error: any) {
    console.error('Exception in GET /api/ai/providers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

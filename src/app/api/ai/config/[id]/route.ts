import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Helper function to get authenticated Supabase client
async function getAuthenticatedClient(request: Request) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { client: null, error: 'Missing or invalid authorization header' };
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
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'Unauthorized: Cannot access AI configuration of another user' },
        { status: 403 },
      );
    }

    // Get the AI configuration from the database
    let config = await prisma.aIConfig.findUnique({
      where: { userId },
    });

    // If no configuration exists, create a default one
    if (!config) {
      config = await prisma.aIConfig.create({
        data: {
          userId,
          defaultProvider: 'openai',
          defaultModel: 'gpt-3.5-turbo',
        },
      });
    }

    // Format the response
    const formattedConfig = {
      id: config.id,
      userId: config.userId,
      defaultProvider: config.defaultProvider,
      defaultModel: config.defaultModel,
      providers: {
        openai: config.openaiApiKey ? {
          apiKey: config.openaiApiKey,
          isEnabled: config.openaiEnabled,
          defaultModel: config.openaiModel,
        } : undefined,
        anthropic: config.anthropicApiKey ? {
          apiKey: config.anthropicApiKey,
          isEnabled: config.anthropicEnabled,
          defaultModel: config.anthropicModel,
        } : undefined,
        groq: config.groqApiKey ? {
          apiKey: config.groqApiKey,
          isEnabled: config.groqEnabled,
          defaultModel: config.groqModel,
        } : undefined,
        openrouter: config.openrouterApiKey ? {
          apiKey: config.openrouterApiKey,
          isEnabled: config.openrouterEnabled,
          defaultModel: config.openrouterModel,
        } : undefined,
      },
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };

    return NextResponse.json({ config: formattedConfig });
  } catch (error: any) {
    console.error('Exception in GET /api/ai/config/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

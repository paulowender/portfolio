import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedClient } from '@/lib/auth-helper';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
        openai: config.openaiApiKey
          ? {
              apiKey: config.openaiApiKey,
              isEnabled: config.openaiEnabled,
              defaultModel: config.openaiModel,
            }
          : undefined,
        anthropic: config.anthropicApiKey
          ? {
              apiKey: config.anthropicApiKey,
              isEnabled: config.anthropicEnabled,
              defaultModel: config.anthropicModel,
            }
          : undefined,
        groq: config.groqApiKey
          ? {
              apiKey: config.groqApiKey,
              isEnabled: config.groqEnabled,
              defaultModel: config.groqModel,
            }
          : undefined,
        openrouter: config.openrouterApiKey
          ? {
              apiKey: config.openrouterApiKey,
              isEnabled: config.openrouterEnabled,
              defaultModel: config.openrouterModel,
            }
          : undefined,
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

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedClient } from '@/lib/auth-helper';

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

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AIProvider } from '@/types/ai';
import { getAuthenticatedClient } from '@/lib/auth-helper';

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
    const { provider, modelId } = body;

    if (!provider || !modelId) {
      return NextResponse.json({ error: 'Provider and model ID are required' }, { status: 400 });
    }

    // Validate provider
    if (!['openai', 'anthropic', 'groq', 'openrouter'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Check if AI configuration exists
    let config = await prisma.aIConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'AI configuration not found. Please set up provider first.' },
        { status: 404 },
      );
    }

    // Prepare update data based on provider
    const updateData: any = {
      defaultModel: modelId,
    };

    switch (provider as AIProvider) {
      case 'openai':
        updateData.openaiModel = modelId;
        break;
      case 'anthropic':
        updateData.anthropicModel = modelId;
        break;
      case 'groq':
        updateData.groqModel = modelId;
        break;
      case 'openrouter':
        updateData.openrouterModel = modelId;
        break;
    }

    // Update configuration
    config = await prisma.aIConfig.update({
      where: { userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, provider, modelId });
  } catch (error: any) {
    console.error('Exception in POST /api/ai/config/[id]/model:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

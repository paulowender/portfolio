import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedClient } from '@/lib/auth-helper';

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
    const { instanceId } = body;

    if (!instanceId) {
      return NextResponse.json({ error: 'Instance ID is required' }, { status: 400 });
    }

    // Update the default instance in the database
    await prisma.messagingConfig.update({
      where: { userId: user.id },
      data: {
        evolutionInstance: instanceId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Exception in POST /api/evolution/default-instance:', error);
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

    // Get the default instance from the database
    const config = await prisma.messagingConfig.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      defaultInstance: config?.evolutionInstance || null,
    });
  } catch (error: any) {
    console.error('Exception in GET /api/evolution/default-instance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

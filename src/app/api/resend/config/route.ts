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
    const { apiKey, fromEmail, fromName, isEnabled } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
    }

    if (!fromEmail) {
      return NextResponse.json({ error: 'From Email is required' }, { status: 400 });
    }

    if (!fromName) {
      return NextResponse.json({ error: 'From Name is required' }, { status: 400 });
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
          resendApiKey: apiKey,
          resendFromEmail: fromEmail,
          resendFromName: fromName,
          resendEnabled: isEnabled,
        },
      });
    } else {
      // Create new configuration
      config = await prisma.messagingConfig.create({
        data: {
          userId: user.id,
          resendApiKey: apiKey,
          resendFromEmail: fromEmail,
          resendFromName: fromName,
          resendEnabled: isEnabled,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Exception in POST /api/resend/config:', error);
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
          fromEmail: '',
          fromName: '',
          isEnabled: false,
        },
      });
    }

    return NextResponse.json({
      config: {
        apiKey: config.resendApiKey || '',
        fromEmail: config.resendFromEmail || '',
        fromName: config.resendFromName || '',
        isEnabled: config.resendEnabled || false,
      },
    });
  } catch (error: any) {
    console.error('Exception in GET /api/resend/config:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

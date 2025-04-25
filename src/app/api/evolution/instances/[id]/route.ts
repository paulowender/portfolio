import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { getAuthenticatedClient } from '@/lib/auth-helper';

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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    const instanceId = (await params).id;

    // Get Evolution API configuration
    const { apiKey, baseUrl } = await getEvolutionConfig(user.id);

    // Get QR code from Evolution API
    try {
      const response = await axios.get(`${baseUrl}/instance/connect/${instanceId}`, {
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
      });

      if (response.status !== 200) {
        return NextResponse.json(
          { error: 'Failed to get QR code from Evolution API' },
          { status: 400 },
        );
      }

      return NextResponse.json({ qrcode: response.data.base64 });
    } catch (err: any) {
      console.error('Error getting QR code from Evolution API:', err);
      return NextResponse.json(
        { error: err.response?.data?.message || 'Failed to get QR code' },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error('Exception in GET /api/evolution/instances/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    const instanceId = (await params).id;

    // Get Evolution API configuration
    const { apiKey, baseUrl } = await getEvolutionConfig(user.id);

    // Delete instance from Evolution API
    try {
      const response = await axios.delete(`${baseUrl}/instance/delete/${instanceId}`, {
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
      });

      if (response.status !== 200) {
        return NextResponse.json(
          { error: 'Failed to delete instance from Evolution API' },
          { status: 400 },
        );
      }

      return NextResponse.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting instance from Evolution API:', err);
      return NextResponse.json(
        { error: err.response?.data?.message || 'Failed to delete instance' },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error('Exception in DELETE /api/evolution/instances/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    const instanceId = (await params).id;

    // Parse the request body
    const body = await request.json();
    const { action } = body;

    if (!action || !['connect', 'disconnect'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "connect" or "disconnect"' },
        { status: 400 },
      );
    }

    // Get Evolution API configuration
    const { apiKey, baseUrl } = await getEvolutionConfig(user.id);

    // Connect or disconnect instance
    try {
      let endpoint = '';

      if (action === 'connect') {
        endpoint = `${baseUrl}/instance/connect/${instanceId}`;
      } else {
        endpoint = `${baseUrl}/instance/logout/${instanceId}`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
      });

      if (response.status !== 200) {
        return NextResponse.json(
          { error: `Failed to ${action} instance in Evolution API` },
          { status: 400 },
        );
      }

      return NextResponse.json({ success: true });
    } catch (err: any) {
      console.error(`Error ${action}ing instance in Evolution API:`, err);
      return NextResponse.json(
        { error: err.response?.data?.message || `Failed to ${action} instance` },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error('Exception in POST /api/evolution/instances/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

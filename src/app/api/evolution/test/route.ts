import { NextResponse } from 'next/server';
import axios from 'axios';
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
    const { apiKey, baseUrl } = body;

    if (!apiKey || !baseUrl) {
      return NextResponse.json({ error: 'API Key and Base URL are required' }, { status: 400 });
    }

    // Test the connection to the Evolution API
    try {
      const response = await axios.get(`${baseUrl}/instance/fetchInstances`, {
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
      });

      if (response.status !== 200) {
        return NextResponse.json({ error: 'Failed to connect to Evolution API' }, { status: 400 });
      }

      return NextResponse.json({ success: true, instances: response.data });
    } catch (err: any) {
      console.error('Error testing Evolution API connection:', err);
      return NextResponse.json(
        { error: err.response?.data?.message || 'Failed to connect to Evolution API' },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error('Exception in POST /api/evolution/test:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

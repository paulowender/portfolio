import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if essential environment variables are set
    const essentialVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'DATABASE_URL',
    ];

    const missingVars = essentialVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Missing environment variables: ${missingVars.join(', ')}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: 'ok',
        message: 'Environment is properly configured',
        env: process.env.NODE_ENV,
        production: process.env.NEXT_PUBLIC_PRODUCTION === 'true',
        staging: process.env.NEXT_PUBLIC_STAGING === 'true',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for the public API
  if (request.nextUrl.pathname.startsWith('/api/public')) {
    // Retrieve the origin from the request or default to '*'
    const origin = request.headers.get('origin') || '*';
    
    // Check if it's a preflight request (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*', // Allow any origin
          'Access-Control-Allow-Methods': 'GET, OPTIONS, PATCH, DELETE, POST, PUT',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // For other methods (GET, POST, etc.), continue the response chain
    const response = NextResponse.next();
    
    // Add CORS headers to the response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  }

  // Fallback for other routes (if any logic is needed, otherwise just next())
  return NextResponse.next();
}

export const config = {
  matcher: '/api/public/:path*',
};

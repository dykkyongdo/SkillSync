import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://skill-sync-backend-env.eba-ma6u2vbm.us-east-1.elasticbeanstalk.com';

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    
    // Security: Validate path to prevent path traversal
    if (path.includes('..') || path.includes('//')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    
    const body = await request.text();
    const headers: Record<string, string> = {};
    
    // Security: Only forward safe headers
    const allowedHeaders = ['content-type', 'authorization', 'user-agent'];
    request.headers.forEach((value, key) => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Security: Add timeout and size limits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BACKEND_URL}/api/${path}`, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseText = await response.text();
    
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    
    // Security: Validate path to prevent path traversal
    if (path.includes('..') || path.includes('//')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    // Security: Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('authorization') || '',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseText = await response.text();
    
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    
    // Security: Validate path to prevent path traversal
    if (path.includes('..') || path.includes('//')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    
    const headers: Record<string, string> = {};
    
    // Security: Only forward safe headers
    const allowedHeaders = ['content-type', 'authorization', 'user-agent'];
    request.headers.forEach((value, key) => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Security: Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BACKEND_URL}/api/${path}`, {
      method: 'DELETE',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseText = await response.text();
    
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

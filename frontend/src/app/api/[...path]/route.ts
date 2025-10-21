import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://skill-sync-backend-env.eba-ma6u2vbm.us-east-1.elasticbeanstalk.com';

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.join('/');
    const body = await request.text();
    const headers: Record<string, string> = {};
    
    // Forward relevant headers
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-type' || key.toLowerCase() === 'authorization') {
        headers[key] = value;
      }
    });

    const response = await fetch(`${BACKEND_URL}/api/${path}`, {
      method: 'POST',
      headers,
      body,
    });

    const responseText = await response.text();
    
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const response = await fetch(`${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('authorization') || '',
      },
    });

    const responseText = await response.text();
    
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // В майбутньому тут можна додати перевірку валідності токена
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Auth check error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
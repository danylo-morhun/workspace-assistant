import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Token request received');
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      console.log('No access token found in cookies');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Access token found, returning');
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Token retrieval error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
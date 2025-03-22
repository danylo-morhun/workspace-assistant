import { NextRequest, NextResponse } from 'next/server';

const REDIRECT_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(`${REDIRECT_BASE}/auth?error=no_code`);
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing OAuth configuration');
      return NextResponse.redirect(`${REDIRECT_BASE}/auth?error=config_error`);
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token exchange failed:', error);
      
      if (error.error === 'invalid_grant') {
        return NextResponse.redirect(`${REDIRECT_BASE}/auth?error=invalid_grant`);
      }
      if (error.error === 'invalid_client') {
        return NextResponse.redirect(`${REDIRECT_BASE}/auth?error=invalid_client`);
      }
      return NextResponse.redirect(`${REDIRECT_BASE}/auth?error=auth_failed`);
    }

    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      console.error('No access token received');
      return NextResponse.redirect(`${REDIRECT_BASE}/auth?error=no_token`);
    }

    const response = NextResponse.redirect(`${REDIRECT_BASE}/dashboard`);

    // Set access token with appropriate security settings
    response.cookies.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });

    // Set refresh token if received
    if (tokens.refresh_token) {
      response.cookies.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 3600 // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(`${REDIRECT_BASE}/auth?error=auth_failed`);
  }
} 
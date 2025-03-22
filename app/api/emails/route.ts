import { NextResponse } from 'next/server';
import { GmailService } from '@/app/services/gmail';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    console.log('Starting GET /api/emails');
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'exists' : 'not found');
    
    if (!session?.accessToken) {
      console.log('No access token in session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Access token details:', {
      tokenLength: session.accessToken.length,
      tokenStart: session.accessToken.substring(0, 10) + '...',
      tokenExpiry: session.expires
    });
    
    console.log('Checking server session for the required scopes...');
    
    console.log('Access token exists, initializing GmailService');
    const gmailService = GmailService.getInstance();
    gmailService.setAccessToken(session.accessToken);
    
    console.log('Validating token before fetching emails...');
    const isTokenValid = await gmailService.validateToken();
    if (!isTokenValid) {
      console.error('Token validation failed');
      return NextResponse.json(
        { error: 'Invalid or insufficient permissions token' },
        { status: 403 }
      );
    }
    
    // Обробка параметрів запиту для пагінації
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const useCache = searchParams.get('useCache') !== 'false';
    
    console.log('Token validation successful, fetching emails...');
    const emails = await gmailService.listEmails(pageSize, page, useCache);
    console.log(`Successfully fetched ${emails.length} emails`);
    
    return NextResponse.json(emails);
  } catch (error) {
    console.error('Detailed error in GET /api/emails:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messageId, action } = await request.json();

    if (!messageId || !action) {
      return NextResponse.json(
        { error: 'Missing messageId or action' },
        { status: 400 }
      );
    }

    const gmailService = GmailService.getInstance();
    gmailService.setAccessToken(session.accessToken);

    switch (action) {
      case 'markAsRead':
        await gmailService.toggleRead(messageId, true);
        break;

      case 'markAsImportant':
        await gmailService.toggleImportant(messageId, true);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error modifying email:', error);
    return NextResponse.json(
      { error: 'Failed to modify email' },
      { status: 500 }
    );
  }
} 
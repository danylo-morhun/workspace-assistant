import { NextResponse } from 'next/server';
import { GmailService } from '@/app/services/gmail';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const gmailService = GmailService.getInstance();
    gmailService.setAccessToken(session.accessToken);
    
    await gmailService.deleteEmail(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete email:', error);
    return NextResponse.json(
      { error: 'Failed to delete email' },
      { status: 500 }
    );
  }
} 
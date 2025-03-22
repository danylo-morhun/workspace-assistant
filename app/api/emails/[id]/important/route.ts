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

    const { isImportant } = await request.json();
    const gmailService = GmailService.getInstance();
    gmailService.setAccessToken(session.accessToken);
    
    await gmailService.toggleImportant(params.id, isImportant);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to toggle important:', error);
    return NextResponse.json(
      { error: 'Failed to toggle important' },
      { status: 500 }
    );
  }
} 
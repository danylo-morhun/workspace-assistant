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
    
    // Перевіряємо, чи лист знаходиться в кошику
    const email = await gmailService.getEmail(params.id);
    const isInTrash = email.labelIds?.includes('TRASH');

    if (isInTrash) {
      // Якщо лист в кошику, видаляємо його повністю
      await gmailService.permanentlyDeleteEmail(params.id);
    } else {
      // Якщо лист не в кошику, переміщуємо його туди
      await gmailService.deleteEmail(params.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete email:', error);
    return NextResponse.json(
      { error: 'Failed to delete email' },
      { status: 500 }
    );
  }
} 
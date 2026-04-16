import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { CommunicationService } from '@/lib/services/communication-service';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { to, subject, content, tags } = await req.json();

    if (!to || !subject || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const result = await CommunicationService.sendEmail({
      organizationId: session.user.organizationId as string,
      userId: session.user.id as string,
      to,
      subject,
      content,
      tags,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API_EMAIL_SEND]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

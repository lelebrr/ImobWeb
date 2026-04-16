import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { CommunicationService } from '@/lib/services/communication-service';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { to, content } = await req.json();

    if (!to || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const result = await CommunicationService.sendSMS({
      organizationId: session.user.organizationId as string,
      userId: session.user.id as string,
      to,
      content,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API_SMS_SEND]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

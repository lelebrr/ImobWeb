import { NextRequest, NextResponse } from 'next/server';
import { CreateNotificationSchema, Notification } from '@/lib/notifications/types';
import { NotificationService } from '@/lib/notifications/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await NotificationService.getByUserId(userId, {
      limit,
      offset,
      unreadOnly,
    });

    const unreadCount = await NotificationService.getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        hasMore: notifications.length === limit,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = CreateNotificationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const notification = await NotificationService.create(validation.data);

    return NextResponse.json({
      success: true,
      data: notification,
    }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar notificação' },
      { status: 500 }
    );
  }
}

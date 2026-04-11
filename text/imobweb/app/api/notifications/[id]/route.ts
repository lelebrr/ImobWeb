import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    const notification = await NotificationService.getById(userId, id);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Get notification error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar notificação' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'markRead') {
      const success = await NotificationService.markAsRead(userId, id);
      return NextResponse.json({
        success,
        message: success ? 'Notificação marcada como lida' : 'Notificação não encontrada',
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar notificação' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    const success = await NotificationService.delete(userId, id);

    if (!success) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notificação excluída',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir notificação' },
      { status: 500 }
    );
  }
}
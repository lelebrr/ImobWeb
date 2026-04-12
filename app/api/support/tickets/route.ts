import { NextRequest, NextResponse } from 'next/server';
import { TicketSystem } from '@/lib/support/ticket-system';

/**
 * API para criação e consulta de tickets de suporte.
 * POST /api/support/tickets
 * GET /api/support/tickets?userId=xxx
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subject, description, priority, category } = body;

    if (!userId || !subject || !description) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
    }

    const ticket = await TicketSystem.createTicket({
      userId,
      subject,
      description,
      priority,
      category
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar chamado.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'UserId é obrigatório.' }, { status: 400 });
  }

  const tickets = TicketSystem.getByUser(userId);
  return NextResponse.json(tickets);
}

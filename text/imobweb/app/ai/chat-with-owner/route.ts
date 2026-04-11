import { NextRequest, NextResponse } from 'next/server';
import { ChatInputSchema, processChat } from '@/lib/ai/chat-agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = ChatInputSchema.safeParse(body);
    
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

    const result = await processChat(validation.data);

    return NextResponse.json({
      success: true,
      data: {
        message: result.message,
        action: result.action,
        data: result.data,
        suggestions: result.suggestions,
        nextSteps: result.nextSteps,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao processar solicitação',
        message: 'Não foi possível processar sua mensagem. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/chat-with-owner',
    method: 'POST',
    description: 'Chat inteligente com proprietário ou corretor',
    body: {
      message: 'Mensagem do usuário (obrigatório)',
      context: {
        propertyId: 'ID do imóvel (opcional)',
        propertyTitle: 'Título do imóvel (opcional)',
        propertyAddress: 'Endereço do imóvel (opcional)',
        ownerName: 'Nome do proprietário (opcional)',
        ownerPhone: 'Telefone do proprietário (opcional)',
        previousMessages: 'Array de mensagens anteriores (opcional)',
        userName: 'Nome do usuário (opcional)',
        userId: 'ID do usuário (opcional)',
      },
      action: 'Ação específica (opcional): chat, suggest_price, generate_description, qualify_lead, schedule_visit',
    },
    response: {
      message: 'Resposta do assistente',
      action: 'Ação triggered (se aplicável)',
      data: 'Dados adicionais (se aplicável)',
      suggestions: 'Sugestões para o usuário',
      nextSteps: 'Próximos passos recomendados',
    },
  });
}
import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.number().optional(),
});

export const ChatInputSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.object({
    propertyId: z.string().optional(),
    propertyTitle: z.string().optional(),
    propertyAddress: z.string().optional(),
    ownerName: z.string().optional(),
    ownerPhone: z.string().optional(),
    previousMessages: z.array(ChatMessageSchema).optional(),
    userName: z.string().optional(),
    userId: z.string().optional(),
  }).optional(),
  action: z.enum(['chat', 'suggest_price', 'generate_description', 'qualify_lead', 'schedule_visit']).optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatInput = z.infer<typeof ChatInputSchema>;

export interface ChatResponse {
  message: string;
  action?: string;
  data?: Record<string, unknown>;
  suggestions?: string[];
  nextSteps?: string[];
}

const SYSTEM_PROMPT = `Você é o assistente virtual inteligente do imobWeb, um CRM imobiliário moderno e eficiente.
Seu objetivo é ajudar corretores, proprietários e clientes de forma rápida, eficiente e amigável.

 Diretrizes:
- Responda sempre em português brasileiro
- Seja breve e objetivo quando possível
- Use linguagem acessível e profissional
- Quando necessário, peça informações adicionais
- Ofereça sugestões úteis e relevantes
- Mantenha contexto da conversa
- Use emojis com moderação para tornar a comunicação mais amigável

 Capacidades disponíveis:
1. Sugestão de preço de imóvel
2. Geração de descrição para imóvel
3. Qualificação de leads
4. Agendamento de visitas
5. Informações sobre imóveis
6. Suporte geral sobre o sistema

 Sempre identifique quando uma ação específica pode ajudar o usuário e sugira.`;

export async function processChat(input: ChatInput): Promise<ChatResponse> {
  const { message, context, action } = input;
  
  const lowerMessage = message.toLowerCase();
  
  if (action && action !== 'chat') {
    return handleAction(action, message, context);
  }
  
  if (containsPriceIntent(lowerMessage)) {
    return {
      message: 'Parece que você está perguntando sobre preço! Para fazer uma sugestão de preço precisa, preciso de algumas informações sobre o imóvel:',
      action: 'collect_property_info',
      suggestions: [
        'Qual o tipo de imóvel? (apartamento, casa, terreno)',
        'Qual a área em m²?',
        'Em qual localização/bairro?',
        'Quantos quartos e banheiros?',
      ],
    };
  }
  
  if (containsDescriptionIntent(lowerMessage)) {
    return {
      message: 'Vou ajudar a criar uma descrição! Para gerar a melhor descrição possível, me passe alguns detalhes:',
      action: 'collect_description_info',
      suggestions: [
        'Tipo de imóvel',
        'Localização',
        'Área',
        'Número de quartos/banheiros',
        'Características especiais',
      ],
    };
  }
  
  if (containsVisitIntent(lowerMessage)) {
    return {
      message: 'Ótimo! Posso ajudar a agendar uma visita. Para isso, preciso saber:',
      action: 'schedule_visit',
      suggestions: [
        'Qual imóvel você gostaria de visitar?',
        'Qual data e horário você prefere?',
        'Seu nome e contato',
      ],
    };
  }
  
  if (containsLeadIntent(lowerMessage)) {
    return {
      message: 'Entendi! Vamos qualificar esse lead. Me diga:',
      action: 'qualify_lead',
      suggestions: [
        'Nome do potencial cliente',
        'Telefone/email de contato',
        'Qual o interesse do cliente? (comprar/alugar)',
        'Qual faixa de preço?',
        'Tem alguma preferência de localização?',
      ],
    };
  }
  
  if (context?.previousMessages && context.previousMessages.length > 0) {
    return handleContextualResponse(message, context);
  }
  
  return generateGeneralResponse(message, context);
}

export function containsPriceIntent(message: string): boolean {
  const keywords = [
    'preço', 'valor', 'quanto custa', 'quanto vale', 'valorizar',
    'sugerir preço', 'estimar', 'vender', 'alugar por quanto',
    'preço justo', 'mercado', 'valorização',
  ];
  return keywords.some(kw => message.includes(kw));
}

export function containsDescriptionIntent(message: string): boolean {
  const keywords = [
    'descrição', 'anunciar', 'publicar', 'texto', 'criar descrição',
    'gerar descrição', 'escrever', 'redigir', 'anúncio',
  ];
  return keywords.some(kw => message.includes(kw));
}

export function containsVisitIntent(message: string): boolean {
  const keywords = [
    'visitar', 'agendar', 'marcar', 'horário', 'dia', 'tour',
    'conhecer', 'ver', 'mostrar', 'apartamento', 'casa',
  ];
  return keywords.some(kw => message.includes(kw));
}

export function containsLeadIntent(message: string): boolean {
  const keywords = [
    'lead', 'cliente', 'interessado', 'contato', 'prospect',
    'novo cliente', 'potencial', 'qualificar', 'captação',
  ];
  return keywords.some(kw => message.includes(kw));
}

function handleAction(action: string, message: string, context?: ChatInput['context']): ChatResponse {
  switch (action) {
    case 'suggest_price':
      return {
        message: 'Perfeito! Vou fazer uma sugestão de preço baseada nas informações do imóvel. Agora preciso que você confirme alguns dados ou me passe novas informações.',
        action: 'suggest_price',
        nextSteps: [
          'Coletar tipo de imóvel',
          'Coletar área',
          'Coletar localização',
          'Gerar sugestão',
        ],
      };
    
    case 'generate_description':
      return {
        message: 'Vou criar uma descrição exclusiva para o imóvel! Me passe os detalhes que você gostaria de destacar.',
        action: 'generate_description',
        nextSteps: [
          'Coletar características',
          'Gerar descrição',
          'Oferecer variações',
        ],
      };
    
    case 'qualify_lead':
      return {
        message: 'Vamos qualificar esse lead! Preciso entender melhor o potencial cliente.',
        action: 'qualify_lead',
        nextSteps: [
          'Coletar informações de contato',
          'Identificar necessidade',
          'Classificar qualificação',
          'Sugerir próximos passos',
        ],
      };
    
    case 'schedule_visit':
      return {
        message: 'Ótimo! Vou ajudar a agendar a visita. Me passe os detalhes.',
        action: 'schedule_visit',
        nextSteps: [
          'Confirmar imóvel',
          'Definir data/horário',
          'Confirmar dados do cliente',
          'Confirmar agendamento',
        ],
      };
    
    default:
      return {
        message: 'Entendi. Como posso ajudar?',
        suggestions: [
          'Sugerir preço de imóvel',
          'Gerar descrição',
          'Qualificar um lead',
          'Agendar visita',
        ],
      };
  }
}

function handleContextualResponse(message: string, context: ChatInput['context']): ChatResponse {
  const lowerMessage = message.toLowerCase();
  
  if (context?.propertyId) {
    if (lowerMessage.includes('sim') || lowerMessage.includes('confirma')) {
      return {
        message: 'Ótimo! As informações foram confirmadas. Posso ajudar com mais alguma coisa relacionada a este imóvel?',
        action: 'confirmed',
        suggestions: [
          'Gerar descrição',
          'Sugerir preço',
          'Agendar visita',
        ],
      };
    }
    
    if (lowerMessage.includes('não') || lowerMessage.includes('corrigir')) {
      return {
        message: 'Sem problemas! Me diga qual informação precisa ser corrigida.',
        action: 'correct_info',
      };
    }
  }
  
  return {
    message: 'Continuei com base na conversa anterior. Posso ajudar de alguma forma específica?',
    suggestions: [
      'Ver detalhes do imóvel',
      'Atualizar informações',
      'Próximos passos',
    ],
  };
}

function generateGeneralResponse(message: string, context?: ChatInput['context']): ChatResponse {
  const greetings = ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'ei', 'opa'];
  const lowerMessage = message.toLowerCase();
  
  if (greetings.some(g => lowerMessage.startsWith(g))) {
    const timeGreeting = getTimeBasedGreeting();
    return {
      message: `${timeGreeting}! Sou o assistente do imobWeb. Como posso ajudar você hoje?`,
      suggestions: [
        'Sugerir preço de imóvel',
        'Gerar descrição',
        'Qualificar um lead',
        'Agendar visita',
        'Ver我的 imóveis',
      ],
    };
  }
  
  if (lowerMessage.includes('obrigado') || lowerMessage.includes('valeu') || lowerMessage.includes('thanks')) {
    return {
      message: 'De nada! Estou sempre à disposição. Posso ajudar com mais alguma coisa?',
      suggestions: [
        'Nova dúvida',
        'Ver imóveis',
        'Falar com atendente',
      ],
    };
  }
  
  if (lowerMessage.includes('ajuda') || lowerMessage.includes('help') || lowerMessage.includes('o que você faz')) {
    return {
      message: 'Posso te ajudar em várias coisas!',
      action: 'show_capabilities',
      suggestions: [
        '💰 Sugerir preço de imóvel',
        '📝 Gerar descrição',
        '👤 Qualificar leads',
        '📅 Agendar visitas',
        '🏠 Ver imóveis',
        '❓ Tirar dúvidas',
      ],
    };
  }
  
  return {
    message: 'Entendi sua mensagem! Para te ajudar melhor, me diz:',
    suggestions: [
      'Sugerir preço',
      'Gerar descrição',
      'Agendar visita',
      'Qualificar lead',
      'Ver imóveis',
    ],
  };
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function buildContextForChat(context?: ChatInput['context']): string {
  if (!context) return '';
  
  let ctx = 'Contexto atual:\n';
  
  if (context.propertyTitle) {
    ctx += `- Imóvel: ${context.propertyTitle}\n`;
  }
  if (context.propertyAddress) {
    ctx += `- Endereço: ${context.propertyAddress}\n`;
  }
  if (context.ownerName) {
    ctx += `- Proprietário: ${context.ownerName}\n`;
  }
  if (context.userName) {
    ctx += `- Usuário: ${context.userName}\n`;
  }
  
  if (context.previousMessages && context.previousMessages.length > 0) {
    ctx += '\nHistórico recente:\n';
    context.previousMessages.slice(-5).forEach(msg => {
      ctx += `${msg.role}: ${msg.content}\n`;
    });
  }
  
  return ctx;
}

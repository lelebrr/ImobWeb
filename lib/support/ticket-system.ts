import { OpenAI } from 'openai';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sistema de Suporte e Tickets do imobWeb.
 * Gerencia a criação e o ciclo de vida dos chamados de suporte.
 */
export class TicketSystem {
  private static tickets: Ticket[] = [];

  /**
   * Cria um novo chamado de suporte.
   */
  static async createTicket(data: {
    userId: string;
    subject: string;
    description: string;
    priority?: TicketPriority;
    category: string;
  }): Promise<Ticket> {
    const newTicket: Ticket = {
      id: `TICK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId: data.userId,
      subject: data.subject,
      description: data.description,
      status: 'OPEN',
      priority: data.priority || 'MEDIUM',
      category: data.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Em produção, isso seria salvo no Banco de Dados (Prisma)
    this.tickets.push(newTicket);
    
    // Simulação de resposta automática da IA baseada no ticket
    console.log(`IA analisando ticket ${newTicket.id} para triagem automática...`);

    return newTicket;
  }

  /**
   * Lista tickets de um usuário específico.
   */
  static getByUser(userId: string): Ticket[] {
    return this.tickets.filter(t => t.userId === userId);
  }

  /**
   * Obtém detalhes de um ticket.
   */
  static getById(id: string): Ticket | undefined {
    return this.tickets.find(t => t.id === id);
  }

  /**
   * Altera o status do ticket.
   */
  static updateStatus(id: string, status: TicketStatus) {
    const ticket = this.getById(id);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date();
    }
  }
}

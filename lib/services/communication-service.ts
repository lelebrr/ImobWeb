import { prisma } from '@/lib/prisma';
import { mandrill } from '@/lib/mailchimp/client';
import { CommunicationType, CommunicationStatus } from '@prisma/client';

export const COMMUNICATION_COSTS = {
  EMAIL: 0.05, // R$ 0.05 por e-mail
  SMS: 0.25,   // R$ 0.25 por SMS
};

export class CommunicationService {
  /**
   * Envia um e-mail transacional via Mandrill
   */
  static async sendEmail(params: {
    organizationId: string;
    userId: string;
    to: string;
    subject: string;
    content: string;
    tags?: string[];
  }) {
    const { organizationId, userId, to, subject, content, tags } = params;

    // 1. Verificar Cota
    const quota = await this.checkAndGetQuota(organizationId, 'EMAIL');
    if (quota.used >= quota.limit) {
      throw new Error('Cota de e-mail excedida para este mês.');
    }

    try {
      // 2. Enviar via Mandrill
      const response = await (mandrill as any).messages.send({
        message: {
          html: content,
          subject: subject,
          from_email: process.env.MAILCHIMP_FROM_EMAIL || 'contato@imobweb.com.br',
          from_name: 'ImobWeb',
          to: [{ email: to, type: 'to' }],
          tags: tags || ['transactional-email'],
        },
      });

      const messageId = response[0]?._id;
      const status = response[0]?.status === 'sent' ? 'ENVIADO' : 'FALHOU';

      // 3. Registrar Uso
      await this.logUsage({
        organizationId,
        userId,
        type: 'EMAIL',
        recipient: to,
        subject,
        content,
        externalId: messageId,
        status: status as any,
        cost: COMMUNICATION_COSTS.EMAIL,
      });

      // 4. Atualizar Cota
      await this.incrementQuota(organizationId, 'EMAIL', COMMUNICATION_COSTS.EMAIL);

      return response;
    } catch (error: any) {
      console.error('Error sending email:', error);
      await this.logUsage({
        organizationId,
        userId,
        type: 'EMAIL',
        recipient: to,
        subject,
        content,
        status: 'FALHOU',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Envia um SMS transacional via Mandrill/Mailchimp
   * Nota: Mandrill usa um endpoint específico de SMS em certas regiões
   */
  static async sendSMS(params: {
    organizationId: string;
    userId: string;
    to: string;
    content: string;
  }) {
    const { organizationId, userId, to, content } = params;

    // 1. Verificar Cota
    const quota = await this.checkAndGetQuota(organizationId, 'SMS');
    if (quota.used >= quota.limit) {
      throw new Error('Cota de SMS excedida para este mês.');
    }

    try {
      // 2. Enviar via Mandrill SMS (Se habilitado) ou Mailchimp Transactional
      // Exemplo usando Mandrill API genérica (verificar se o endpoint de SMS está disponível)
      const response = await (mandrill as any).messages.sendSms({
        to: to,
        content: content,
      });

      const externalId = response?.id || 'manual-' + Date.now();
      const status = response?.status === 'sent' ? 'ENVIADO' : 'FALHOU';

      // 3. Registrar Uso
      await this.logUsage({
        organizationId,
        userId,
        type: 'SMS',
        recipient: to,
        content,
        externalId: externalId,
        status: status as any,
        cost: COMMUNICATION_COSTS.SMS,
      });

      // 4. Atualizar Cota
      await this.incrementQuota(organizationId, 'SMS', COMMUNICATION_COSTS.SMS);

      return response;
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      await this.logUsage({
        organizationId,
        userId,
        type: 'SMS',
        recipient: to,
        content,
        status: 'FALHOU',
        error: error.message,
      });
      throw error;
    }
  }

  private static async checkAndGetQuota(organizationId: string, type: CommunicationType) {
    let quota = await prisma.communicationQuota.findUnique({
      where: { organizationId_type: { organizationId, type } },
    });

    if (!quota) {
      // Cria uma cota padrão se não existir (baseado no plano)
      quota = await prisma.communicationQuota.create({
        data: {
          organizationId,
          type,
          limit: type === 'EMAIL' ? 1000 : 50, // Defaults
          resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });
    }

    // Lógica simples de reset se a data passou
    if (new Date() > quota.resetDate) {
      quota = await prisma.communicationQuota.update({
        where: { id: quota.id },
        data: {
          used: 0,
          resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });
    }

    return quota;
  }

  private static async incrementQuota(organizationId: string, type: CommunicationType, cost: number) {
    await prisma.communicationQuota.update({
      where: { organizationId_type: { organizationId, type } },
      data: {
        used: { increment: 1 },
        estimatedCost: { increment: cost },
      },
    });
  }

  private static async logUsage(data: any) {
    await prisma.communicationUsage.create({
      data: {
        ...data,
      },
    });
  }
}

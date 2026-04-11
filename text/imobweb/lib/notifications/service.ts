import { v4 as uuidv4 } from 'uuid';
import {
  Notification,
  CreateNotification,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationWithMeta,
  NOTIFICATION_ICONS,
} from './types';

export class NotificationService {
  private static notifications: Map<string, Notification[]> = new Map();
  private static pushSubscriptions: Map<string, Set<PushSubscription>> = new Map();

  static async create(notification: CreateNotification): Promise<Notification> {
    const id = uuidv4();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: Date.now(),
    };

    const userNotifications = this.notifications.get(notification.userId) || [];
    userNotifications.unshift(newNotification);
    
    const maxNotifications = 100;
    if (userNotifications.length > maxNotifications) {
      userNotifications.length = maxNotifications;
    }
    
    this.notifications.set(notification.userId, userNotifications);

    if (notification.channels.includes('push') && notification.sendPush) {
      await this.sendPushNotification(newNotification);
    }

    if (notification.channels.includes('email') && notification.sendEmail) {
      await this.sendEmailNotification(newNotification);
    }

    return newNotification;
  }

  static async getByUserId(userId: string, options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationWithMeta[]> {
    const notifications = this.notifications.get(userId) || [];
    
    let filtered = notifications;
    if (options?.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    const offset = options?.offset || 0;
    const limit = options?.limit || 20;
    
    return filtered
      .slice(offset, offset + limit)
      .map(n => this.enrichNotification(n));
  }

  static async getById(userId: string, notificationId: string): Promise<NotificationWithMeta | null> {
    const notifications = this.notifications.get(userId) || [];
    const notification = notifications.find(n => n.id === notificationId);
    
    return notification ? this.enrichNotification(notification) : null;
  }

  static async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const notifications = this.notifications.get(userId);
    if (!notifications) return false;

    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  static async markAllAsRead(userId: string): Promise<number> {
    const notifications = this.notifications.get(userId);
    if (!notifications) return 0;

    let count = 0;
    notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        count++;
      }
    });
    return count;
  }

  static async delete(userId: string, notificationId: string): Promise<boolean> {
    const notifications = this.notifications.get(userId);
    if (!notifications) return false;

    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications.splice(index, 1);
      return true;
    }
    return false;
  }

  static async deleteExpired(userId: string): Promise<number> {
    const notifications = this.notifications.get(userId);
    if (!notifications) return 0;

    const now = Date.now();
    const originalLength = notifications.length;
    
    const filtered = notifications.filter(n => 
      !n.expiresAt || n.expiresAt > now
    );
    
    this.notifications.set(userId, filtered);
    return originalLength - filtered.length;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const notifications = this.notifications.get(userId) || [];
    return notifications.filter(n => !n.read).length;
  }

  static async subscribeToPush(userId: string, subscription: PushSubscription): Promise<void> {
    const userSubscriptions = this.pushSubscriptions.get(userId) || new Set();
    userSubscriptions.add(subscription);
    this.pushSubscriptions.set(userId, userSubscriptions);
  }

  static async unsubscribeFromPush(userId: string, endpoint: string): Promise<boolean> {
    const userSubscriptions = this.pushSubscriptions.get(userId);
    if (!userSubscriptions) return false;

    for (const sub of userSubscriptions) {
      if (sub.endpoint === endpoint) {
        userSubscriptions.delete(sub);
        return true;
      }
    }
    return false;
  }

  static async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    const userSubscriptions = this.pushSubscriptions.get(userId);
    return userSubscriptions ? Array.from(userSubscriptions) : [];
  }

  private static async sendPushNotification(notification: Notification): Promise<void> {
    const subscriptions = await this.getPushSubscriptions(notification.userId);
    
    for (const sub of subscriptions) {
      try {
        console.log(`Sending push to ${sub.endpoint}`);
      } catch (error) {
        console.error('Push notification error:', error);
      }
    }
  }

  private static async sendEmailNotification(notification: Notification): Promise<void> {
    console.log(`Sending email notification to user ${notification.userId}: ${notification.title}`);
  }

  private static enrichNotification(notification: Notification): NotificationWithMeta {
    const timeDiff = Date.now() - notification.createdAt;
    let formattedTime: string;

    if (timeDiff < 60000) {
      formattedTime = 'Agora mesmo';
    } else if (timeDiff < 3600000) {
      const mins = Math.floor(timeDiff / 60000);
      formattedTime = `${mins} minuto${mins > 1 ? 's' : ''} atrás`;
    } else if (timeDiff < 86400000) {
      const hours = Math.floor(timeDiff / 3600000);
      formattedTime = `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else if (timeDiff < 604800000) {
      const days = Math.floor(timeDiff / 86400000);
      formattedTime = `${days} dia${days > 1 ? 's' : ''} atrás`;
    } else {
      formattedTime = new Date(notification.createdAt).toLocaleDateString('pt-BR');
    }

    return {
      ...notification,
      formattedTime,
      icon: NOTIFICATION_ICONS[notification.type],
      actionUrl: (notification.data as any)?.url || undefined,
    };
  }

  static createFromType(
    userId: string,
    type: NotificationType,
    data?: Record<string, unknown>,
    priority?: NotificationPriority
  ): CreateNotification {
    const messages = {
      new_lead: {
        title: 'Novo Lead! 🚀',
        body: 'Você recebeu um novo lead. Entre em contato rapidamente para não perder a oportunidade.',
      },
      property_update: {
        title: 'Imóvel Atualizado 🏠',
        body: 'As informações do imóvel foram atualizadas com sucesso.',
      },
      property_status_change: {
        title: 'Status Alterado 📊',
        body: `O status do imóvel "${data?.propertyTitle || 'imóvel'}" foi alterado para ${data?.newStatus || 'novo status'}.`,
      },
      new_message: {
        title: 'Nova Mensagem 💬',
        body: data?.senderName 
          ? `${data.senderName} enviou uma nova mensagem.` 
          : 'Você recebeu uma nova mensagem.',
      },
      price_suggestion: {
        title: 'Sugestão de Preço 💰',
        body: 'Uma nova sugestão de preço está disponível para seu imóvel.',
      },
      description_generated: {
        title: 'Descrição Gerada 📝',
        body: 'A descrição do imóvel foi gerada e está pronta para uso.',
      },
      visit_scheduled: {
        title: 'Visita Agendada 📅',
        body: data?.date 
          ? `Uma visita foi agendada para ${new Date(data.date as string).toLocaleDateString('pt-BR')}.`
          : 'Uma visita foi agendada com sucesso.',
      },
      visit_reminder: {
        title: 'Lembrete de Visita ⏰',
        body: 'Você tem uma visita agendada para hoje. Não esqueça!',
      },
      system_alert: {
        title: 'Alerta do Sistema ⚠️',
        body: data?.message as string || 'Verifique as informações do sistema.',
      },
      weekly_report: {
        title: 'Relatório Semanal 📈',
        body: 'Seu relatório semanal de performance está disponível.',
      },
      payment_received: {
        title: 'Pagamento Recebido ✅',
        body: 'O pagamento foi processado com sucesso.',
      },
      payment_failed: {
        title: 'Pagamento Falhou ❌',
        body: 'O pagamento não foi processado. Verifique os dados de pagamento.',
      },
      subscription_expiring: {
        title: 'Assinatura Expirando ⏳',
        body: 'Sua assinatura expira em breve. Renove agora para continuar usando todos os recursos.',
      },
    };

    const message = messages[type];
    return {
      userId,
      type,
      title: message.title,
      body: message.body,
      data,
      priority: priority || 'normal',
      channels: ['in_app'],
      read: false,
      sendPush: true,
      sendEmail: false,
    };
  }
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const notificationService = NotificationService;

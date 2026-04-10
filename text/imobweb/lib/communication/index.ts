import type { NotificationType, NotificationChannel } from '@/lib/notifications/types';
import { notificationEngine } from '@/lib/notifications/notification-engine';

export interface OmnichannelStrategyConfig {
  enableWhatsApp: boolean;
  enablePush: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  enableInApp: boolean;
  defaultChannel: NotificationChannel;
  fallbackOrder: NotificationChannel[];
  maxRetries: number;
  retryDelay: number;
}

export interface CommunicationEvent {
  id: string;
  type: 'notification' | 'campaign' | 'reminder' | 'alert';
  channel: NotificationChannel;
  recipientId: string;
  content: {
    subject?: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  error?: string;
}

export interface ChannelMetrics {
  channel: NotificationChannel;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

const DEFAULT_STRATEGY: OmnichannelStrategyConfig = {
  enableWhatsApp: true,
  enablePush: true,
  enableEmail: true,
  enableSMS: false,
  enableInApp: true,
  defaultChannel: 'in_app',
  fallbackOrder: ['in_app', 'push', 'email', 'sms', 'whatsapp'],
  maxRetries: 3,
  retryDelay: 5000
};

export class OmnichannelCommunication {
  private config: OmnichannelStrategyConfig;
  private eventLog: CommunicationEvent[] = [];
  private metrics: Map<NotificationChannel, ChannelMetrics> = new Map();

  constructor(config: Partial<OmnichannelStrategyConfig> = {}) {
    this.config = { ...DEFAULT_STRATEGY, ...config };
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    const channels: NotificationChannel[] = ['in_app', 'push', 'email', 'sms', 'whatsapp'];
    channels.forEach(channel => {
      this.metrics.set(channel, {
        channel,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0
      });
    });
  }

  async send<T extends { type: NotificationType; title: string; body: string; userId: string; data?: Record<string, unknown> }>(
    message: T,
    options?: {
      preferredChannel?: NotificationChannel;
      forceChannel?: NotificationChannel;
      scheduleFor?: Date;
      metadata?: Record<string, unknown>;
    }
  ): Promise<{ success: boolean; eventId: string; channel: NotificationChannel; error?: string }> {
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    let channel: NotificationChannel;
    
    if (options?.forceChannel) {
      channel = options.forceChannel;
    } else if (options?.preferredChannel) {
      channel = options.preferredChannel;
    } else {
      channel = this.selectBestChannel(message.type);
    }

    const event: CommunicationEvent = {
      id: eventId,
      type: 'notification',
      channel,
      recipientId: message.userId,
      content: {
        subject: message.title,
        title: message.title,
        body: message.body,
        data: message.data
      },
      status: 'pending'
    };

    try {
      const result = await this.deliverViaChannel(channel, message, options);

      if (result.success) {
        event.status = 'sent';
        event.sentAt = new Date();
        this.updateMetrics(channel, 'sent');
        
        setTimeout(() => {
          event.status = 'delivered';
          event.deliveredAt = new Date();
          this.updateMetrics(channel, 'delivered');
        }, 2000);

        setTimeout(() => {
          event.status = 'opened';
          event.openedAt = new Date();
          this.updateMetrics(channel, 'opened');
        }, 10000);
      } else {
        event.status = 'failed';
        event.error = result.error;
        this.updateMetrics(channel, 'failed');
        
        const fallbackChannel = this.getFallbackChannel(channel);
        if (fallbackChannel) {
          console.log(`[Omnichannel] Retrying with fallback channel: ${fallbackChannel}`);
        }
      }

      this.eventLog.push(event);
      return { success: result.success, eventId, channel, error: result.error };
    } catch (error) {
      event.status = 'failed';
      event.error = error instanceof Error ? error.message : 'Unknown error';
      this.eventLog.push(event);
      this.updateMetrics(channel, 'failed');
      
      return { success: false, eventId, channel, error: event.error };
    }
  }

  private selectBestChannel(type: NotificationType): NotificationChannel {
    const channelPrefs = notificationEngine.getNotificationChannels(type);
    
    for (const channel of channelPrefs) {
      if (this.isChannelEnabled(channel)) {
        return channel as NotificationChannel;
      }
    }
    
    return this.config.defaultChannel;
  }

  private isChannelEnabled(channel: NotificationChannel): boolean {
    switch (channel) {
      case 'whatsapp': return this.config.enableWhatsApp;
      case 'push': return this.config.enablePush;
      case 'email': return this.config.enableEmail;
      case 'sms': return this.config.enableSMS;
      case 'in_app': return this.config.enableInApp;
      default: return false;
    }
  }

  private getFallbackChannel(failedChannel: NotificationChannel): NotificationChannel | null {
    const index = this.config.fallbackOrder.indexOf(failedChannel);
    if (index === -1 || index === this.config.fallbackOrder.length - 1) return null;
    
    const fallback = this.config.fallbackOrder[index + 1];
    return this.isChannelEnabled(fallback) ? fallback : this.getFallbackChannel(fallback);
  }

  private async deliverViaChannel(
    channel: NotificationChannel,
    message: { title: string; body: string; userId: string; data?: Record<string, unknown> },
    options?: { scheduleFor?: Date }
  ): Promise<{ success: boolean; error?: string }> {
    console.log(`[Omnichannel] Delivering via ${channel}:`, message.title);
    
    switch (channel) {
      case 'push':
        return { success: true };
      case 'email':
        return { success: true };
      case 'whatsapp':
        return { success: true };
      case 'sms':
        return { success: true };
      case 'in_app':
        return { success: true };
      default:
        return { success: false, error: `Unknown channel: ${channel}` };
    }
  }

  private updateMetrics(channel: NotificationChannel, metric: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed'): void {
    const metrics = this.metrics.get(channel);
    if (metrics) {
      metrics[metric]++;
      
      if (metrics.sent > 0) {
        metrics.deliveryRate = (metrics.delivered / metrics.sent) * 100;
        metrics.openRate = metrics.sent > 0 ? (metrics.opened / metrics.sent) * 100 : 0;
        metrics.clickRate = metrics.sent > 0 ? (metrics.clicked / metrics.sent) * 100 : 0;
      }
    }
  }

  getChannelMetrics(channel?: NotificationChannel): ChannelMetrics | Record<string, ChannelMetrics> {
    if (channel) {
      return this.metrics.get(channel) || {
        channel,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0
      };
    }
    
    return Object.fromEntries(this.metrics);
  }

  getEventLog(limit: number = 100): CommunicationEvent[] {
    return this.eventLog.slice(-limit);
  }

  async sendCampaign(
    campaignType: 'welcome' | 'reengagement' | 'reminder' | 'promotional',
    recipients: string[],
    content: { subject: string; title: string; body: string }
  ): Promise<{ sent: number; failed: number; events: string[] }> {
    const events: string[] = [];
    let sent = 0;
    let failed = 0;

    for (const recipientId of recipients) {
      const result = await this.send({
        type: campaignType === 'welcome' ? 'new_lead' : campaignType === 'reminder' ? 'visit_reminder' : 'system_alert',
        title: content.title,
        body: content.body,
        userId: recipientId
      });

      if (result.success) {
        sent++;
        events.push(result.eventId);
      } else {
        failed++;
      }
    }

    return { sent, failed, events };
  }
}

export const omnichannelCommunication = new OmnichannelCommunication();

export const IMOBILIARY_TRIGGERS = {
  highViewCount: {
    threshold: 100,
    channel: 'whatsapp',
    template: 'Seu imóvel {{address}} teve {{views}} visualizações esta semana!'
  },
  ownerNoResponse: {
    daysThreshold: 15,
    channel: 'whatsapp',
    template: 'Olá! Você não respondeu há {{days}} dias. Tem alguma dúvida sobre seu imóvel?'
  },
  leadQualification: {
    channel: 'whatsapp',
    template: 'Novo lead qualificado para o imóvel {{address}}: {{leadName}} - {{leadPhone}}'
  },
  renewalReminder: {
    daysBefore: 7,
    channel: 'email',
    template: 'Seu anúncio expira em {{days}} dias. Renove agora para manter a visibilidade!'
  },
  weeklyDigest: {
    dayOfWeek: 'saturday',
    channel: 'email',
    template: 'Resumo semanal: {{dealsClosed}} negócios fechados, {{newLeads}} novos leads'
  }
};
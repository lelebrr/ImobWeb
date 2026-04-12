import type { Notification, NotificationChannel, NotificationPriority, NotificationType, NotificationPreferences, PushSubscription } from './types';

export type ChannelPreference = 'whatsapp' | 'push' | 'email' | 'sms' | 'in_app';

interface ChannelConfig {
  channel: NotificationChannel;
  enabled: boolean;
  priority: number;
  minPriority: NotificationPriority;
  maxRetries: number;
  retryDelay: number;
}

interface NotificationContext {
  userId: string;
  userPreferences: NotificationPreferences;
  userPushSubscription?: PushSubscription;
  userEmail?: string;
  userPhone?: string;
  userWhatsApp?: string;
  currentHour?: number;
}

interface RoutingDecision {
  channel: NotificationChannel;
  reason: string;
  confidence: number;
}

const CHANNEL_CONFIGS: Record<NotificationChannel, ChannelConfig> = {
  whatsapp: {
    channel: 'whatsapp',
    enabled: true,
    priority: 1,
    minPriority: 'normal',
    maxRetries: 3,
    retryDelay: 5000
  },
  push: {
    channel: 'push',
    enabled: true,
    priority: 2,
    minPriority: 'low',
    maxRetries: 5,
    retryDelay: 3000
  },
  email: {
    channel: 'email',
    enabled: true,
    priority: 3,
    minPriority: 'low',
    maxRetries: 2,
    retryDelay: 10000
  },
  sms: {
    channel: 'sms',
    enabled: false,
    priority: 4,
    minPriority: 'high',
    maxRetries: 2,
    retryDelay: 5000
  },
  in_app: {
    channel: 'in_app',
    enabled: true,
    priority: 0,
    minPriority: 'low',
    maxRetries: 0,
    retryDelay: 0
  }
};

const PRIORITY_WEIGHTS: Record<NotificationPriority, number> = {
  urgent: 100,
  high: 75,
  normal: 50,
  low: 25
};

const TYPE_CHANNEL_PREFERENCES: Record<NotificationType, ChannelPreference[]> = {
  new_lead: ['whatsapp', 'push', 'in_app'],
  property_update: ['push', 'in_app'],
  property_status_change: ['push', 'email', 'in_app'],
  new_message: ['whatsapp', 'push', 'in_app'],
  price_suggestion: ['push', 'email', 'in_app'],
  description_generated: ['push', 'in_app'],
  visit_scheduled: ['whatsapp', 'push', 'email'],
  visit_reminder: ['whatsapp', 'push', 'in_app'],
  system_alert: ['push', 'email', 'in_app'],
  weekly_report: ['email', 'in_app'],
  payment_received: ['push', 'email', 'in_app'],
  payment_failed: ['whatsapp', 'push', 'email'],
  subscription_expiring: ['email', 'push', 'whatsapp']
};

const PRIORITY_THRESHOLDS = {
  urgent: ['whatsapp', 'push', 'email', 'in_app'],
  high: ['whatsapp', 'push', 'email', 'in_app'],
  normal: ['push', 'in_app', 'email'],
  low: ['in_app', 'push']
};

export class NotificationEngine {
  private channelHandlers: Map<NotificationChannel, ChannelHandler> = new Map();

  registerChannelHandler(channel: NotificationChannel, handler: ChannelHandler): void {
    this.channelHandlers.set(channel, handler);
  }

  async routeNotification(notification: Notification, context: NotificationContext): Promise<RoutingDecision[]> {
    const decisions: RoutingDecision[] = [];
    const preferredChannels = this.getPreferredChannels(notification.type, notification.priority);
    const userChannelPrefs = context.userPreferences.channels;
    const availableChannels = this.getAvailableChannels(context);

    for (const channel of preferredChannels) {
      if (!this.isChannelEnabled(channel, userChannelPrefs, context)) continue;
      if (!this.isChannelAvailable(channel, context)) continue;
      if (!this.meetsPriorityThreshold(channel, notification.priority)) continue;

      const confidence = this.calculateChannelConfidence(channel, notification, context);
      const reason = this.getRoutingReason(channel, notification, context);

      decisions.push({ channel, reason, confidence });

      if (notification.priority === 'urgent' || notification.priority === 'high') {
        break;
      }
    }

    if (decisions.length === 0) {
      decisions.push({
        channel: 'in_app',
        reason: 'Fallback - nenhum outro canal disponível',
        confidence: 0.5
      });
    }

    return decisions.sort((a, b) => b.confidence - a.confidence);
  }

  private getPreferredChannels(type: NotificationType, priority: NotificationPriority): NotificationChannel[] {
    const typePrefs = TYPE_CHANNEL_PREFERENCES[type];
    const thresholdChannels = PRIORITY_THRESHOLDS[priority];
    
    return typePrefs.filter(channel => thresholdChannels.includes(channel)) as NotificationChannel[];
  }

  private getAvailableChannels(context: NotificationContext): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    if (context.userPreferences.channels.inApp) channels.push('in_app');
    if (context.userPreferences.channels.push && context.userPushSubscription) channels.push('push');
    if (context.userPreferences.channels.email && context.userEmail) channels.push('email');
    if (context.userPreferences.channels.sms && context.userPhone) channels.push('sms');
    if (context.userPreferences.channels.whatsapp && context.userWhatsApp) channels.push('whatsapp');

    return channels;
  }

  private isChannelEnabled(
    channel: NotificationChannel,
    prefs: NotificationPreferences['channels'],
    context: NotificationContext
  ): boolean {
    if (!CHANNEL_CONFIGS[channel].enabled) return false;

    switch (channel) {
      case 'in_app': return prefs.inApp;
      case 'push': return prefs.push;
      case 'email': return prefs.email;
      case 'sms': return prefs.sms;
      case 'whatsapp': return prefs.whatsapp;
      default: return false;
    }
  }

  private isChannelAvailable(channel: NotificationChannel, context: NotificationContext): boolean {
    switch (channel) {
      case 'push': return !!context.userPushSubscription;
      case 'email': return !!context.userEmail;
      case 'sms': return !!context.userPhone;
      case 'whatsapp': return !!context.userWhatsApp;
      default: return true;
    }
  }

  private meetsPriorityThreshold(channel: NotificationChannel, priority: NotificationPriority): boolean {
    const config = CHANNEL_CONFIGS[channel];
    const priorityWeight = PRIORITY_WEIGHTS[priority];
    const minWeight = PRIORITY_WEIGHTS[config.minPriority];
    return priorityWeight >= minWeight;
  }

  private calculateChannelConfidence(
    channel: NotificationChannel,
    notification: Notification,
    context: NotificationContext
  ): number {
    let confidence = 0.5;
    const config = CHANNEL_CONFIGS[channel];

    confidence += (10 - config.priority) * 0.05;

    if (notification.priority === 'urgent' && channel === 'whatsapp') {
      confidence += 0.3;
    } else if (notification.priority === 'low' && channel === 'email') {
      confidence += 0.2;
    }

    if (this.isInQuietHours(context)) {
      if (channel === 'in_app') {
        confidence += 0.3;
      } else {
        confidence -= 0.3;
      }
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private getRoutingReason(channel: NotificationChannel, notification: Notification, context: NotificationContext): string {
    switch (channel) {
      case 'whatsapp':
        return 'Alta prioridade e preferable para messages urgentes';
      case 'push':
        return 'Notificação instantânea com alta taxa de engajamento';
      case 'email':
        return 'Melhor para conteúdo detalhado e não urgente';
      case 'sms':
        return 'Fallback para urgência máxima sem internet';
      case 'in_app':
        return 'Canal sempre disponível com menor custo';
      default:
        return 'Canal padrão';
    }
  }

  private isInQuietHours(context: NotificationContext): boolean {
    const quietHours = context.userPreferences.quietHours;
    if (!quietHours?.enabled || context.currentHour === undefined) return false;

    const now = context.currentHour;
    const start = quietHours.start || 0;
    const end = quietHours.end || 1440;

    if (start <= end) {
      return now >= start && now <= end;
    } else {
      return now >= start || now <= end;
    }
  }

  async sendNotification(
    notification: Notification,
    context: NotificationContext
  ): Promise<{ success: boolean; channels: Record<string, boolean>; errors: string[] }> {
    const decisions = await this.routeNotification(notification, context);
    const results: Record<string, boolean> = {};
    const errors: string[] = [];

    for (const decision of decisions) {
      const handler = this.channelHandlers.get(decision.channel);
      if (!handler) {
        results[decision.channel] = false;
        errors.push(`No handler for channel: ${decision.channel}`);
        continue;
      }

      try {
        const success = await handler.send(notification, context);
        results[decision.channel] = success;
        if (!success) {
          errors.push(`Failed to send via ${decision.channel}`);
        }
      } catch (error) {
        results[decision.channel] = false;
        errors.push(`Error sending via ${decision.channel}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const allFailed = Object.values(results).every(r => !r);
    return { success: !allFailed, channels: results, errors };
  }

  async scheduleNotification(
    notification: Notification,
    scheduledFor: Date,
    context: NotificationContext
  ): Promise<string> {
    const scheduleId = `schedule-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    console.log(`[NotificationEngine] Scheduled notification ${notification.id} for ${scheduledFor.toISOString()}`);
    
    return scheduleId;
  }

  getNotificationChannels(type: NotificationType): ChannelPreference[] {
    return TYPE_CHANNEL_PREFERENCES[type];
  }
}

interface ChannelHandler {
  send(notification: Notification, context: NotificationContext): Promise<boolean>;
  validateDestination(context: NotificationContext): boolean;
}

export const notificationEngine = new NotificationEngine();

export function createDefaultPreferences(userId: string): NotificationPreferences {
  return {
    userId,
    channels: {
      inApp: true,
      push: true,
      email: true,
      sms: false,
      whatsapp: false
    },
    types: {
      newLead: true,
      propertyUpdate: true,
      systemAlerts: true,
      weeklyReports: true,
      reminders: true
    },
    quietHours: {
      enabled: false,
      timezone: 'America/Sao_Paulo'
    }
  };
}

export function prioritizeNotifications(notifications: Notification[]): Notification[] {
  return notifications.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.createdAt - a.createdAt;
  });
}

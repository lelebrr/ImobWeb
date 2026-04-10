import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { notificationEngine, createDefaultPreferences, prioritizeNotifications } from '@/lib/notifications/notification-engine';
import { pushService, createPushPayload } from '@/lib/push';
import type { Notification, NotificationPreferences, NotificationPriority, NotificationType } from '@/lib/notifications/types';

const createNotificationSchema = z.object({
  userId: z.string(),
  type: z.enum([
    'new_lead', 'property_update', 'property_status_change', 'new_message',
    'price_suggestion', 'description_generated', 'visit_scheduled', 'visit_reminder',
    'system_alert', 'weekly_report', 'payment_received', 'payment_failed', 'subscription_expiring'
  ]),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  data: z.record(z.unknown()).optional(),
  sendPush: z.boolean().default(true),
  sendEmail: z.boolean().default(false),
  scheduledFor: z.string().datetime().optional()
});

const preferencesSchema = z.object({
  userId: z.string(),
  channels: z.object({
    inApp: z.boolean().optional(),
    push: z.boolean().optional(),
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    whatsapp: z.boolean().optional()
  }).optional(),
  types: z.object({
    newLead: z.boolean().optional(),
    propertyUpdate: z.boolean().optional(),
    systemAlerts: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
    reminders: z.boolean().optional()
  }).optional(),
  quietHours: z.object({
    enabled: z.boolean().optional(),
    start: z.number().optional(),
    end: z.number().optional(),
    timezone: z.string().optional()
  }).optional()
});

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', userId: 'user-1', type: 'new_lead', title: 'Novo Lead', body: 'Você recebeu um novo lead!', priority: 'high', read: false, createdAt: Date.now() - 300000, channels: ['push', 'whatsapp'] },
  { id: '2', userId: 'user-1', type: 'property_update', title: 'Imóvel Atualizado', body: 'O imóvel foi atualizado.', priority: 'normal', read: false, createdAt: Date.now() - 1800000, channels: ['push'] },
  { id: '3', userId: 'user-1', type: 'visit_scheduled', title: 'Visita Agendada', body: 'Uma visita foi agendada.', priority: 'normal', read: true, createdAt: Date.now() - 7200000, channels: ['whatsapp', 'push'] }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let notifications = MOCK_NOTIFICATIONS;

    if (userId) {
      notifications = notifications.filter(n => n.userId === userId);
    }

    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    notifications = prioritizeNotifications(notifications).slice(0, limit);

    const stats = {
      total: MOCK_NOTIFICATIONS.length,
      unread: MOCK_NOTIFICATIONS.filter(n => !n.read).length,
      byPriority: {
        urgent: MOCK_NOTIFICATIONS.filter(n => n.priority === 'urgent').length,
        high: MOCK_NOTIFICATIONS.filter(n => n.priority === 'high').length,
        normal: MOCK_NOTIFICATIONS.filter(n => n.priority === 'normal').length,
        low: MOCK_NOTIFICATIONS.filter(n => n.priority === 'low').length
      }
    };

    return NextResponse.json({ notifications, stats });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'send') {
      const validated = createNotificationSchema.parse(body);
      
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        userId: validated.userId,
        type: validated.type,
        title: validated.title,
        body: validated.body,
        priority: validated.priority,
        data: validated.data,
        read: false,
        createdAt: Date.now(),
        channels: ['in_app']
      };

      const preferences = createDefaultPreferences(validated.userId);
      const context = {
        userId: validated.userId,
        userPreferences: preferences,
        userEmail: 'user@example.com',
        userPhone: '+5511999999999',
        userWhatsApp: '+5511999999999',
        currentHour: new Date().getHours()
      };

      const result = await notificationEngine.sendNotification(notification, context);

      if (validated.sendPush) {
        const payload = createPushPayload(validated.type, validated.title, validated.body, validated.data);
        await pushService.showNotification(payload);
      }

      return NextResponse.json({ success: true, notificationId: notification.id, channels: result.channels });
    }

    if (action === 'preferences') {
      const validated = preferencesSchema.parse(body);
      
      const preferences: NotificationPreferences = {
        userId: validated.userId,
        channels: {
          inApp: validated.channels?.inApp ?? true,
          push: validated.channels?.push ?? true,
          email: validated.channels?.email ?? true,
          sms: validated.channels?.sms ?? false,
          whatsapp: validated.channels?.whatsapp ?? false
        },
        types: {
          newLead: validated.types?.newLead ?? true,
          propertyUpdate: validated.types?.propertyUpdate ?? true,
          systemAlerts: validated.types?.systemAlerts ?? true,
          weeklyReports: validated.types?.weeklyReports ?? true,
          reminders: validated.types?.reminders ?? true
        },
        quietHours: validated.quietHours ? {
          enabled: validated.quietHours.enabled ?? false,
          start: validated.quietHours.start,
          end: validated.quietHours.end,
          timezone: validated.quietHours.timezone ?? 'America/Sao_Paulo'
        } : { enabled: false, timezone: 'America/Sao_Paulo' }
      };

      return NextResponse.json({ success: true, preferences });
    }

    if (action === 'markRead') {
      const { notificationId, userId } = z.object({
        notificationId: z.string(),
        userId: z.string()
      }).parse(body);

      return NextResponse.json({ success: true, message: `Notification ${notificationId} marked as read` });
    }

    if (action === 'markAllRead') {
      const { userId } = z.object({ userId: z.string() }).parse(body);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error processing notification action:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Notification ${notificationId} deleted` });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
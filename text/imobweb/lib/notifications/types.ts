import { z } from 'zod';

export const NotificationTypeSchema = z.enum([
  'new_lead',
  'property_update',
  'property_status_change',
  'new_message',
  'price_suggestion',
  'description_generated',
  'visit_scheduled',
  'visit_reminder',
  'system_alert',
  'weekly_report',
  'payment_received',
  'payment_failed',
  'subscription_expiring',
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

export const NotificationChannelSchema = z.enum(['in_app', 'push', 'email', 'sms', 'whatsapp']);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const NotificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: NotificationTypeSchema,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  data: z.record(z.unknown()).optional(),
  priority: NotificationPrioritySchema.default('normal'),
  read: z.boolean().default(false),
  createdAt: z.number().default(() => Date.now()),
  expiresAt: z.number().optional(),
  channels: z.array(NotificationChannelSchema).default(['in_app']),
});

export type Notification = z.infer<typeof NotificationSchema>;

export const CreateNotificationSchema = NotificationSchema.omit({ id: true, createdAt: true }).extend({
  sendPush: z.boolean().default(true),
  sendEmail: z.boolean().default(false),
  scheduledFor: z.number().optional(),
});

export type CreateNotification = z.infer<typeof CreateNotificationSchema>;

export const NotificationPreferencesSchema = z.object({
  userId: z.string(),
  channels: z.object({
    inApp: z.boolean().default(true),
    push: z.boolean().default(true),
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    whatsapp: z.boolean().default(false),
  }),
  types: z.object({
    newLead: z.boolean().default(true),
    propertyUpdate: z.boolean().default(true),
    systemAlerts: z.boolean().default(true),
    weeklyReports: z.boolean().default(true),
    reminders: z.boolean().default(true),
  }),
  quietHours: z.object({
    enabled: z.boolean().default(false),
    start: z.number().min(0).max(1439).optional(),
    end: z.number().min(0).max(1439).optional(),
    timezone: z.string().default('America/Sao_Paulo'),
  }).optional(),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export const PushSubscriptionSchema = z.object({
  userId: z.string(),
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  createdAt: z.number().default(() => Date.now()),
  lastUsed: z.number().optional(),
});

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>;

export interface NotificationWithMeta extends Notification {
  formattedTime?: string;
  icon?: string;
  actionUrl?: string;
}

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  new_lead: '👤',
  property_update: '🏠',
  property_status_change: '📊',
  new_message: '💬',
  price_suggestion: '💰',
  description_generated: '📝',
  visit_scheduled: '📅',
  visit_reminder: '⏰',
  system_alert: '⚠️',
  weekly_report: '📈',
  payment_received: '✅',
  payment_failed: '❌',
  subscription_expiring: '⏳',
};

export const NOTIFICATION_MESSAGES: Record<NotificationType, { title: string; body: string }> = {
  new_lead: {
    title: 'Novo Lead!',
    body: 'Você recebeu um novo lead. Entre em contato rapidamente.',
  },
  property_update: {
    title: 'Imóvel Atualizado',
    body: 'As informações do imóvel foram atualizadas.',
  },
  property_status_change: {
    title: 'Status Alterado',
    body: 'O status do imóvel foi alterado.',
  },
  new_message: {
    title: 'Nova Mensagem',
    body: 'Você recebeu uma nova mensagem.',
  },
  price_suggestion: {
    title: 'Sugestão de Preço',
    body: 'Uma nova sugestão de preço está disponível.',
  },
  description_generated: {
    title: 'Descrição Gerada',
    body: 'A descrição do imóvel está pronta.',
  },
  visit_scheduled: {
    title: 'Visita Agendada',
    body: 'Uma visita foi agendada com sucesso.',
  },
  visit_reminder: {
    title: 'Lembrete de Visita',
    body: 'Você tem uma visita agendada em breve.',
  },
  system_alert: {
    title: 'Alerta do Sistema',
    body: 'Verifique as informações do sistema.',
  },
  weekly_report: {
    title: 'Relatório Semanal',
    body: 'Seu relatório semanal está disponível.',
  },
  payment_received: {
    title: 'Pagamento Recebido',
    body: 'O pagamento foi processado com sucesso.',
  },
  payment_failed: {
    title: 'Pagamento Falhou',
    body: 'O pagamento não foi processado. Verifique os dados.',
  },
  subscription_expiring: {
    title: 'Assinatura Expirando',
    body: 'Sua assinatura expira em breve. Renove agora.',
  },
};
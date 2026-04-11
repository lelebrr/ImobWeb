'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, Check, CheckCheck, Trash2, X, MessageCircle, Mail, Smartphone, Home, Calendar, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType, NotificationWithMeta } from '@/lib/notifications/types';

interface NotificationBellProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  new_lead: <MessageCircle className="h-5 w-5 text-blue-500" />,
  property_update: <Home className="h-5 w-5 text-green-500" />,
  property_status_change: <TrendingUp className="h-5 w-5 text-purple-500" />,
  new_message: <MessageCircle className="h-5 w-5 text-blue-500" />,
  price_suggestion: <TrendingUp className="h-5 w-5 text-green-500" />,
  description_generated: <MessageCircle className="h-5 w-5 text-indigo-500" />,
  visit_scheduled: <Calendar className="h-5 w-5 text-orange-500" />,
  visit_reminder: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  system_alert: <AlertTriangle className="h-5 w-5 text-red-500" />,
  weekly_report: <TrendingUp className="h-5 w-5 text-blue-500" />,
  payment_received: <CreditCard className="h-5 w-5 text-green-500" />,
  payment_failed: <AlertTriangle className="h-5 w-5 text-red-500" />,
  subscription_expiring: <AlertTriangle className="h-5 w-5 text-amber-500" />
};

const MOCK_NOTIFICATIONS: NotificationWithMeta[] = [
  {
    id: '1',
    userId: 'user-1',
    type: 'new_lead',
    title: 'Novo Lead!',
    body: 'Maria Santos está interessada no imóvel na Rua das Flores, 123. Entre em contato rapidamente!',
    priority: 'high',
    read: false,
    createdAt: Date.now() - 1000 * 60 * 5,
    channels: ['whatsapp', 'push'],
    data: { propertyId: 'prop-1', leadId: 'lead-1' },
    formattedTime: '5 min',
    icon: '👤'
  },
  {
    id: '2',
    userId: 'user-1',
    type: 'property_update',
    title: 'Imóvel Atualizado',
    body: 'As fotos do imóvel na Av. Paulista foram atualizadas.',
    priority: 'normal',
    read: false,
    createdAt: Date.now() - 1000 * 60 * 30,
    channels: ['push'],
    data: { propertyId: 'prop-2' },
    formattedTime: '30 min',
    icon: '🏠'
  },
  {
    id: '3',
    userId: 'user-1',
    type: 'visit_scheduled',
    title: 'Visita Agendada',
    body: 'Visita agendada para amanhã às 14h no imóvel da Rua Augusta.',
    priority: 'normal',
    read: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    channels: ['whatsapp', 'push'],
    data: { visitId: 'visit-1', propertyId: 'prop-3' },
    formattedTime: '2h',
    icon: '📅'
  },
  {
    id: '4',
    userId: 'user-1',
    type: 'weekly_report',
    title: 'Relatório Semanal',
    body: 'Seu relatório semanal está disponível. Você fechou 12 negócios este mês!',
    priority: 'low',
    read: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    channels: ['email', 'in_app'],
    data: { reportId: 'report-1' },
    formattedTime: '1 dia',
    icon: '📈'
  },
  {
    id: '5',
    userId: 'user-1',
    type: 'subscription_expiring',
    title: 'Assinatura Expirando',
    body: 'Sua assinatura expira em 5 dias. Renove agora para continuar com todos os recursos.',
    priority: 'high',
    read: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    channels: ['email', 'push'],
    data: { subscriptionId: 'sub-1' },
    formattedTime: '2 dias',
    icon: '⏳'
  }
];

export function NotificationBell({ userId, onNotificationClick, onMarkAllRead, onClearAll }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationWithMeta[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onMarkAllRead?.();
  };

  const handleClearAll = () => {
    setNotifications([]);
    onClearAll?.();
  };

  const handleNotificationClick = (notification: NotificationWithMeta) => {
    handleMarkAsRead(notification.id);
    onNotificationClick?.(notification as Notification);
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 transition-colors"
      >
        {unreadCount > 0 ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5 text-gray-400" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex border-b px-2 py-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                filter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                filter === 'unread' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              Não lidas {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <BellOff className="mb-2 h-10 w-10" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50',
                      !notification.read && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                      {NOTIFICATION_ICONS[notification.type] || <Bell className="h-5 w-5 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'font-medium text-gray-900 truncate',
                          !notification.read && 'font-semibold'
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className={cn('h-2 w-2 rounded-full flex-shrink-0', getPriorityColor(notification.priority))} />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">
                        {notification.body}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {notification.formattedTime}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t px-4 py-3">
            <Button variant="outline" className="w-full text-sm" onClick={() => setIsOpen(false)}>
              Ver todas as notificações
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onAction?: () => void;
}

export function NotificationToast({ notification, onClose, onAction }: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 rounded-lg border bg-white shadow-lg animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
          {NOTIFICATION_ICONS[notification.type] || <Bell className="h-5 w-5 text-gray-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{notification.title}</p>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{notification.body}</p>
          {onAction && (
            <button
              onClick={onAction}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Ver detalhes
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

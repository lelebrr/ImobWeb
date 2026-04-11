import type { PushSubscription as PushSubscriptionType } from '@/lib/notifications/types';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  vibrate?: number[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export class PushNotificationService {
  private vapidPublicKey: string;
  private subscriptionEndpoint: string | null = null;

  constructor(vapidPublicKey?: string) {
    this.vapidPublicKey = vapidPublicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  }

  async requestPermission(): Promise<PushSubscriptionType | null> {
    if (!('Notification' in window)) {
      console.warn('[Push] Notifications not supported');
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('[Push] Service Workers not supported');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('[Push] Permission denied:', permission);
        return null;
      }

      const subscription = await this.subscribeToPush();
      return subscription;
    } catch (error) {
      console.error('[Push] Error requesting permission:', error);
      return null;
    }
  }

  private async subscribeToPush(): Promise<PushSubscriptionType | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      const pushSubscription: PushSubscriptionType = {
        userId: 'current-user',
        endpoint: subscription.endpoint,
        keys: {
          p256dh: (subscription as unknown as { keys: { p256dh: string } }).keys.p256dh,
          auth: (subscription as unknown as { keys: { auth: string } }).keys.auth
        },
        createdAt: Date.now(),
        lastUsed: Date.now()
      };

      await this.sendSubscriptionToServer(pushSubscription);
      
      console.log('[Push] Subscribed successfully');
      return pushSubscription;
    } catch (error) {
      console.error('[Push] Error subscribing:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('[Push] Unsubscribed successfully');
      }
      
      return true;
    } catch (error) {
      console.error('[Push] Error unsubscribing:', error);
      return false;
    }
  }

  async showNotification(payload: PushNotificationPayload): Promise<boolean> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.svg',
        badge: payload.badge || '/icons/badge-72x72.png',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
        vibrate: payload.vibrate,
        actions: payload.actions
      });

      return true;
    } catch (error) {
      console.error('[Push] Error showing notification:', error);
      return false;
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscriptionType): Promise<void> {
    try {
      await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('[Push] Error sending subscription to server:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }
}

export const pushService = new PushNotificationService();

export function createPushPayload(
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): PushNotificationPayload {
  const basePayload: PushNotificationPayload = {
    title,
    body,
    tag: type,
    data: { ...data, type, timestamp: Date.now() },
    requireInteraction: type === 'urgent',
    silent: type === 'low'
  };

  switch (type) {
    case 'new_lead':
      basePayload.actions = [
        { action: 'view', title: 'Ver Lead' },
        { action: 'contact', title: 'Contatar' }
      ];
      basePayload.vibrate = [200, 100, 200];
      break;
    case 'property_update':
      basePayload.icon = '/icons/property.svg';
      break;
    case 'visit_reminder':
      basePayload.requireInteraction = true;
      basePayload.vibrate = [300, 200, 300];
      break;
    default:
      break;
  }

  return basePayload;
}

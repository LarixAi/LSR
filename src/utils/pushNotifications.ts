import { supabase } from '@/integrations/supabase/client';

// Base64 URL to Uint8Array helper for VAPID public key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  const permission = await Notification.requestPermission();
  return permission;
}

export async function subscribeToPush(registration: ServiceWorkerRegistration, publicVapidKey: string, userId: string) {
  if (!('pushManager' in registration)) return null;
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    const json = subscription.toJSON() as any;
    const endpoint: string = json.endpoint;
    const p256dh: string = json.keys?.p256dh;
    const auth: string = json.keys?.auth;

    if (!endpoint || !p256dh || !auth) return null;

    const { error } = await supabase.from('web_push_subscriptions').insert({
      user_id: userId,
      endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent
    });

    if (error) throw error;
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push', error);
    return null;
  }
}

export async function unsubscribeFromPush(registration: ServiceWorkerRegistration, userId: string) {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await supabase.from('web_push_subscriptions').delete().eq('user_id', userId).eq('endpoint', endpoint);
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push', error);
  }
}



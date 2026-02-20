import { supabase } from '@/integrations/supabase/client';

/**
 * Register the current device for push notifications.
 * Called after login on mobile/PWA.
 */
export async function registerPushDevice(deviceToken: string, platform: 'ios' | 'android' | 'web') {
  const { data, error } = await supabase.functions.invoke('push-register-device', {
    body: { platform, device_token: deviceToken, app_version: '1.0.0' },
  });

  if (error) {
    console.error('[Push] Registration failed:', error);
    return null;
  }
  return data;
}

/**
 * Unregister a device token (e.g., on logout).
 */
export async function unregisterPushDevice(deviceToken: string) {
  const { error } = await supabase
    .from('push_devices' as any)
    .delete()
    .eq('device_token', deviceToken);

  if (error) console.error('[Push] Unregister failed:', error);
}

/**
 * Request web push permission and get token.
 * Returns null if denied or unsupported.
 */
export async function requestWebPushPermission(): Promise<string | null> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.log('[Push] Not supported in this browser');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('[Push] Permission denied');
    return null;
  }

  // In production, this would use FCM's getToken() with VAPID key
  // For now, generate a placeholder that the service worker can use
  const registration = await navigator.serviceWorker.ready;
  
  // TODO: Replace with actual FCM/web-push subscription
  // const subscription = await registration.pushManager.subscribe({
  //   userVisibleOnly: true,
  //   applicationServerKey: VAPID_PUBLIC_KEY,
  // });
  // return JSON.stringify(subscription);
  
  console.log('[Push] Web push ready, waiting for FCM configuration');
  return null;
}

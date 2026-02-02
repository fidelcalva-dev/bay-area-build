import { supabase } from '@/integrations/supabase/client';
import type { TimelineEventType } from './timelineService';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type NotificationChannel = 'IN_APP' | 'SMS' | 'EMAIL' | 'SLACK' | 'GOOGLE_CHAT';

export interface StaffNotification {
  id: string;
  user_id: string;
  event_id: string | null;
  notification_type: TimelineEventType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  title: string;
  message: string | null;
  action_url: string | null;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
}

/**
 * Fetch unread notifications for current user
 */
export async function getUnreadNotifications(): Promise<StaffNotification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('staff_notifications' as never)
    .select('*')
    .eq('user_id', user.id)
    .is('read_at', null)
    .is('dismissed_at', null)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }

  return (data || []) as unknown as StaffNotification[];
}

/**
 * Fetch all notifications for current user
 */
export async function getAllNotifications(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ notifications: StaffNotification[]; count: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { notifications: [], count: 0 };

  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const { data, error, count } = await supabase
    .from('staff_notifications' as never)
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to fetch notifications:', error);
    return { notifications: [], count: 0 };
  }

  return { 
    notifications: (data || []) as unknown as StaffNotification[], 
    count: count || 0 
  };
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('staff_notifications' as never)
    .update({ read_at: new Date().toISOString() } as never)
    .eq('id', notificationId);

  if (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }

  return true;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('staff_notifications' as never)
    .update({ read_at: new Date().toISOString() } as never)
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) {
    console.error('Failed to mark all notifications as read:', error);
    return false;
  }

  return true;
}

/**
 * Dismiss a notification
 */
export async function dismissNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('staff_notifications' as never)
    .update({ dismissed_at: new Date().toISOString() } as never)
    .eq('id', notificationId);

  if (error) {
    console.error('Failed to dismiss notification:', error);
    return false;
  }

  return true;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('staff_notifications' as never)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)
    .is('dismissed_at', null);

  if (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }

  return count || 0;
}

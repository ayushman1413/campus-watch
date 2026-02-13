import { supabase } from '@/lib/supabase/supabaseClient';
import type { Notification, NotificationType } from '@/lib/types';

export const notificationsAPI = {
  // Get user notifications
  getUserNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get unread notifications count
  getUnreadCount: async (userId: string) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'unread');

    if (error) throw new Error(error.message);
    return count || 0;
  },

  // Get unread notifications
  getUnreadNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'unread')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Create notification
  createNotification: async (notification: Partial<Notification>) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...notification, status: 'unread', created_at: new Date() }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Mark as read
  markAsRead: async (notificationId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ status: 'read', read_at: new Date() })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Mark all as read
  markAllAsRead: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read', read_at: new Date() })
      .eq('user_id', userId)
      .eq('status', 'unread');

    if (error) throw new Error(error.message);
  },

  // Archive notification
  archiveNotification: async (notificationId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ status: 'archived' })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
    if (error) throw new Error(error.message);
  },

  // Send claim notification
  sendClaimNotification: async (userId: string, claimId: string, itemTitle: string) => {
    return notificationsAPI.createNotification({
      user_id: userId,
      type: 'claim',
      title: 'New Claim on Your Item',
      message: `Someone claimed your item: ${itemTitle}`,
      related_claim_id: claimId,
    });
  },

  // Send match notification
  sendMatchNotification: async (userId: string, itemId: string, matchCount: number) => {
    return notificationsAPI.createNotification({
      user_id: userId,
      type: 'match',
      title: 'AI Matches Found',
      message: `We found ${matchCount} potential matches for your item!`,
      related_item_id: itemId,
    });
  },

  // Send status update notification
  sendStatusNotification: async (userId: string, itemId: string, status: string) => {
    return notificationsAPI.createNotification({
      user_id: userId,
      type: 'status',
      title: 'Item Status Updated',
      message: `Your item status has been updated to: ${status}`,
      related_item_id: itemId,
    });
  },

  // Bulk create notifications
  bulkCreateNotifications: async (notifications: Partial<Notification>[]) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications.map(n => ({ ...n, status: 'unread', created_at: new Date() })))
      .select();

    if (error) throw new Error(error.message);
    return data || [];
  },
};

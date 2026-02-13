import { create } from 'zustand';
import { notificationsAPI } from '@/lib/api/notifications';
import type { Notification } from '@/lib/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  fetchNotifications: (userId: string) => Promise<void>;
  fetchUnreadNotifications: (userId: string) => Promise<void>;
  getUnreadCount: (userId: string) => Promise<void>;
  createNotification: (notification: Partial<Notification>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  archiveNotification: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (userId) => {
    try {
      set({ loading: true, error: null });
      const data = await notificationsAPI.getUserNotifications(userId);
      set({ notifications: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchUnreadNotifications: async (userId) => {
    try {
      set({ loading: true, error: null });
      const data = await notificationsAPI.getUnreadNotifications(userId);
      set({ notifications: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const count = await notificationsAPI.getUnreadCount(userId);
      set({ unreadCount: count });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createNotification: async (notification) => {
    try {
      set({ loading: true, error: null });
      const newNotification = await notificationsAPI.createNotification(notification);
      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      set({ loading: true, error: null });
      await notificationsAPI.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, status: 'read' } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  markAllAsRead: async (userId) => {
    try {
      set({ loading: true, error: null });
      await notificationsAPI.markAllAsRead(userId);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, status: 'read' })),
        unreadCount: 0,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  archiveNotification: async (notificationId) => {
    try {
      set({ loading: true, error: null });
      await notificationsAPI.archiveNotification(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, status: 'archived' } : n
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      set({ loading: true, error: null });
      await notificationsAPI.deleteNotification(notificationId);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ notifications: [], unreadCount: 0, loading: false, error: null }),
}));

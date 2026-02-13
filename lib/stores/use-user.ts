import { create } from 'zustand';
import { usersAPI } from '@/lib/api/users';
import type { UserProfile } from '@/lib/types';

interface UserState {
  profile: UserProfile | null;
  stats: any;
  leaderboard: UserProfile[];
  loading: boolean;
  error: string | null;

  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  fetchStats: (userId: string) => Promise<void>;
  fetchLeaderboard: (limit?: number) => Promise<void>;
  searchUsers: (query: string) => Promise<UserProfile[]>;
  verifyUser: (userId: string) => Promise<void>;
  updateReputation: (userId: string, points: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  stats: null,
  leaderboard: [],
  loading: false,
  error: null,

  fetchProfile: async (userId) => {
    try {
      set({ loading: true, error: null });
      const data = await usersAPI.getProfile(userId);
      set({ profile: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async (userId, updates) => {
    try {
      set({ loading: true, error: null });
      const updated = await usersAPI.updateProfile(userId, updates);
      set({ profile: updated, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchStats: async (userId) => {
    try {
      set({ loading: true, error: null });
      const data = await usersAPI.getUserStats(userId);
      set({ stats: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchLeaderboard: async (limit = 10) => {
    try {
      set({ loading: true, error: null });
      const data = await usersAPI.getLeaderboard(limit);
      set({ leaderboard: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  searchUsers: async (query) => {
    try {
      const data = await usersAPI.searchUsers(query);
      return data;
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  verifyUser: async (userId) => {
    try {
      set({ loading: true, error: null });
      await usersAPI.verifyUser(userId);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateReputation: async (userId, points) => {
    try {
      set({ loading: true, error: null });
      const updated = await usersAPI.updateReputation(userId, points);
      set({ profile: updated, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ profile: null, stats: null, leaderboard: [], loading: false, error: null }),
}));

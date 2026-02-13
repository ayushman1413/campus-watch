import { supabase } from '@/lib/supabase/supabaseClient';
import type { UserProfile } from '@/lib/types';

export const usersAPI = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Get user stats
  getUserStats: async (userId: string) => {
    const profile = await usersAPI.getProfile(userId);

    const { data: lostItems } = await supabase
      .from('items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', 'lost');

    const { data: foundItems } = await supabase
      .from('items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', 'found');

    const { data: approvedClaims } = await supabase
      .from('claims')
      .select('id')
      .eq('claimant_id', userId)
      .eq('status', 'approved');

    return {
      items_lost: lostItems?.length || 0,
      items_found: foundItems?.length || 0,
      items_recovered: approvedClaims?.length || 0,
      reputation_score: profile?.reputation_score || 0,
      success_rate: profile?.success_rate || 0,
    };
  },

  // Update reputation
  updateReputation: async (userId: string, points: number) => {
    const profile = await usersAPI.getProfile(userId);
    const newScore = (profile?.reputation_score || 0) + points;

    return usersAPI.updateProfile(userId, {
      reputation_score: Math.max(0, newScore),
    });
  },

  // Get leaderboard
  getLeaderboard: async (limit = 10) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('reputation_score', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Search users
  searchUsers: async (query: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Verify user email
  verifyUser: async (userId: string) => {
    return usersAPI.updateProfile(userId, {
      is_verified: true,
    });
  },

  // Get user activity
  getUserActivity: async (userId: string) => {
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('*')
      .or(`claimant_id.eq.${userId},item_owner_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (itemsError || claimsError) throw new Error('Error fetching activity');

    return { items: items || [], claims: claims || [] };
  },
};

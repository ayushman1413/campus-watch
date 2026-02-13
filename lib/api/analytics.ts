import { supabase } from '@/lib/supabase/supabaseClient';
import type { AnalyticsData } from '@/lib/types';

export const analyticsAPI = {
  // Get overall dashboard stats
  getDashboardStats: async () => {
    const { data: lostItems, error: lostError } = await supabase
      .from('items')
      .select('id')
      .eq('item_type', 'lost')
      .eq('is_claimed', false);

    const { data: foundItems, error: foundError } = await supabase
      .from('items')
      .select('id')
      .eq('item_type', 'found')
      .eq('is_claimed', false);

    const { data: claimedItems, error: claimedError } = await supabase
      .from('items')
      .select('id')
      .eq('is_claimed', true);

    const { data: approvedClaims, error: approvedError } = await supabase
      .from('claims')
      .select('id')
      .eq('status', 'approved');

    const { data: activeUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student');

    if (lostError || foundError || claimedError || approvedError || usersError) {
      throw new Error('Error fetching dashboard stats');
    }

    const totalLost = lostItems?.length || 0;
    const totalFound = foundItems?.length || 0;
    const totalClaimed = claimedItems?.length || 0;
    const totalApproved = approvedClaims?.length || 0;

    return {
      total_items_lost: totalLost,
      total_items_found: totalFound,
      total_items_claimed: totalClaimed,
      active_claims: totalApproved,
      claim_success_rate: totalFound > 0 ? (totalApproved / totalFound * 100).toFixed(2) : 0,
      active_users: activeUsers?.length || 0,
    };
  },

  // Get category statistics
  getCategoryStats: async () => {
    const { data: lostItems, error: lostError } = await supabase
      .from('items')
      .select('category')
      .eq('item_type', 'lost')
      .eq('is_claimed', false);

    const { data: foundItems, error: foundError } = await supabase
      .from('items')
      .select('category')
      .eq('item_type', 'found')
      .eq('is_claimed', false);

    if (lostError || foundError) throw new Error('Error fetching category stats');

    const categoryCounts: Record<string, number> = {};
    [...(lostItems || []), ...(foundItems || [])].forEach((item: any) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    return categoryCounts;
  },

  // Get location statistics
  getLocationStats: async () => {
    const { data: items, error } = await supabase
      .from('items')
      .select('location')
      .eq('is_claimed', false);

    if (error) throw new Error(error.message);

    const locationCounts: Record<string, number> = {};
    (items || []).forEach((item: any) => {
      locationCounts[item.location] = (locationCounts[item.location] || 0) + 1;
    });

    return locationCounts;
  },

  // Get monthly trends
  getMonthlyTrends: async (months = 6) => {
    const { data: items, error } = await supabase
      .from('items')
      .select('created_at');

    if (error) throw new Error(error.message);

    const trends: Record<string, number> = {};
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      trends[monthKey] = 0;
    }

    (items || []).forEach((item: any) => {
      const itemDate = new Date(item.created_at);
      const monthKey = itemDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (monthKey in trends) {
        trends[monthKey] += 1;
      }
    });

    return trends;
  },

  // Get user statistics
  getUserStats: async (userId: string) => {
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id, item_type, is_claimed')
      .eq('user_id', userId);

    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('id, status')
      .or(`claimant_id.eq.${userId},item_owner_id.eq.${userId}`);

    if (itemsError || claimsError) throw new Error('Error fetching user stats');

    const lostCount = items?.filter((i: any) => i.item_type === 'lost').length || 0;
    const foundCount = items?.filter((i: any) => i.item_type === 'found').length || 0;
    const claimedCount = items?.filter((i: any) => i.is_claimed).length || 0;
    const successfulClaims = claims?.filter((c: any) => c.status === 'approved').length || 0;

    return {
      items_lost: lostCount,
      items_found: foundCount,
      items_claimed: claimedCount,
      successful_claims: successfulClaims,
      success_rate: claims && claims.length > 0 ? (successfulClaims / claims.length * 100).toFixed(2) : 0,
    };
  },

  // Get claim resolution time
  getClaimResolutionTime: async () => {
    const { data: claims, error } = await supabase
      .from('claims')
      .select('created_at, resolved_at')
      .eq('status', 'approved');

    if (error) throw new Error(error.message);

    if (!claims || claims.length === 0) return 0;

    const times = claims.map((claim: any) => {
      if (!claim.resolved_at) return 0;
      const created = new Date(claim.created_at).getTime();
      const resolved = new Date(claim.resolved_at).getTime();
      return (resolved - created) / (1000 * 60 * 60); // hours
    });

    const avgTime = times.reduce((a: number, b: number) => a + b, 0) / times.length;
    return Math.round(avgTime);
  },

  // Get top items (most claimed)
  getTopItems: async (limit = 10) => {
    const { data, error } = await supabase
      .from('items')
      .select('*, claims_count:claims(count)')
      .eq('is_claimed', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get lost/found ratio
  getLostFoundRatio: async () => {
    const { data: lostItems } = await supabase
      .from('items')
      .select('id')
      .eq('item_type', 'lost');

    const { data: foundItems } = await supabase
      .from('items')
      .select('id')
      .eq('item_type', 'found');

    const total = (lostItems?.length || 0) + (foundItems?.length || 0);
    return {
      lost: lostItems?.length || 0,
      found: foundItems?.length || 0,
      total,
      lost_percentage: total > 0 ? ((lostItems?.length || 0) / total * 100).toFixed(1) : 0,
      found_percentage: total > 0 ? ((foundItems?.length || 0) / total * 100).toFixed(1) : 0,
    };
  },
};

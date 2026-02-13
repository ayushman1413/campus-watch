import { supabase } from '@/lib/supabase/supabaseClient';
import type { Item, AIMatch } from '@/lib/types';

export const itemsAPI = {
  // Fetch all items with filters
  fetchItems: async (filters?: {
    type?: 'lost' | 'found';
    category?: string;
    location?: string;
    status?: string;
  }) => {
    let query = supabase.from('items').select('*');

    if (filters?.type) query = query.eq('item_type', filters.type);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.location) query = query.eq('location', filters.location);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get single item with details
  getItem: async (id: string) => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Create new item
  createItem: async (item: Partial<Item>, userId: string) => {
    const { data, error } = await supabase
      .from('items')
      .insert([{ ...item, user_id: userId, status: 'active' }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Update item
  updateItem: async (id: string, updates: Partial<Item>) => {
    const { data, error } = await supabase
      .from('items')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Delete item
  deleteItem: async (id: string) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Get AI matches for an item
  getAIMatches: async (itemId: string) => {
    try {
      const item = await itemsAPI.getItem(itemId);
      const candidates = await itemsAPI.fetchItems({
        type: item.item_type === 'lost' ? 'found' : 'lost',
        category: item.category,
      });

      const matches = candidates
        .map((candidate: any) => ({
          id: candidate.id,
          title: candidate.title,
          match_score: calculateMatchScore(item, candidate),
          reason: generateMatchReason(item, candidate),
        }))
        .filter((m: any) => m.match_score > 0.4)
        .sort((a: any, b: any) => b.match_score - a.match_score)
        .slice(0, 5);

      return { item_id: itemId, matched_items: matches, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('AI matching error:', error);
      return { item_id: itemId, matched_items: [], timestamp: new Date().toISOString() };
    }
  },

  // Search items
  searchItems: async (query: string) => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`
      )
      .eq('is_claimed', false)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },
};

// Helper: Calculate similarity score between items
function calculateMatchScore(item1: any, item2: any): number {
  let score = 0;

  if (item1.category === item2.category) score += 0.4;
  if (item1.color === item2.color && item1.color) score += 0.3;
  if (item1.location === item2.location) score += 0.2;
  if (item1.category === 'Phone' || item1.category === 'Wallet') score += 0.1;

  return Math.min(score, 1);
}

// Helper: Generate reason for match
function generateMatchReason(item1: any, item2: any): string {
  const reasons: string[] = [];
  if (item1.category === item2.category) reasons.push('Same category');
  if (item1.color === item2.color && item1.color) reasons.push('Matching color');
  if (item1.location === item2.location) reasons.push('Same location');
  return reasons.join(', ') || 'Potential match';
}

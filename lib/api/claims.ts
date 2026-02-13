import { supabase } from '@/lib/supabase/supabaseClient';
import type { Claim } from '@/lib/types';

export const claimsAPI = {
  // Get claims for user
  getUserClaims: async (userId: string) => {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .or(`claimant_id.eq.${userId},item_owner_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get item claims
  getItemClaims: async (itemId: string) => {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get single claim
  getClaim: async (id: string) => {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Create claim
  createClaim: async (claim: Partial<Claim>) => {
    const otpCode = Math.random().toString().slice(2, 8);
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

    const { data, error } = await supabase
      .from('claims')
      .insert([{ ...claim, otp: otpCode, otp_expires_at: expiresAt, status: 'pending' }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Update claim
  updateClaim: async (id: string, updates: Partial<Claim>) => {
    const { data, error } = await supabase
      .from('claims')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Verify OTP
  verifyOTP: async (claimId: string, otp: string) => {
    const claim = await claimsAPI.getClaim(claimId);

    if (!claim.otp || claim.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    if (new Date() > new Date(claim.otp_expires_at)) {
      throw new Error('OTP expired');
    }

    return await claimsAPI.updateClaim(claimId, { status: 'approved' });
  },

  // Approve claim
  approveClaim: async (id: string) => {
    const { data: claim, error: fetchError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    // Update claim status
    const { data, error: updateError } = await supabase
      .from('claims')
      .update({ status: 'approved', resolved_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // Mark item as claimed
    await supabase.from('items').update({ is_claimed: true }).eq('id', claim.item_id);

    return data;
  },

  // Reject claim
  rejectClaim: async (id: string, reason?: string) => {
    const { data, error } = await supabase
      .from('claims')
      .update({ status: 'rejected', resolved_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Delete claim
  deleteClaim: async (id: string) => {
    const { error } = await supabase.from('claims').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

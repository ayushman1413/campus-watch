import { create } from 'zustand';
import { claimsAPI } from '@/lib/api/claims';
import type { Claim } from '@/lib/types';

interface ClaimsState {
  claims: Claim[];
  selectedClaim: Claim | null;
  loading: boolean;
  error: string | null;

  fetchUserClaims: (userId: string) => Promise<void>;
  fetchItemClaims: (itemId: string) => Promise<void>;
  fetchClaim: (id: string) => Promise<void>;
  createClaim: (claim: Partial<Claim>) => Promise<void>;
  updateClaim: (id: string, updates: Partial<Claim>) => Promise<void>;
  approveClaim: (id: string) => Promise<void>;
  rejectClaim: (id: string, reason?: string) => Promise<void>;
  deleteClaim: (id: string) => Promise<void>;
  verifyOTP: (claimId: string, otp: string) => Promise<void>;
  setSelectedClaim: (claim: Claim | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useClaimsStore = create<ClaimsState>((set, get) => ({
  claims: [],
  selectedClaim: null,
  loading: false,
  error: null,

  fetchUserClaims: async (userId) => {
    try {
      set({ loading: true, error: null });
      const data = await claimsAPI.getUserClaims(userId);
      set({ claims: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchItemClaims: async (itemId) => {
    try {
      set({ loading: true, error: null });
      const data = await claimsAPI.getItemClaims(itemId);
      set({ claims: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchClaim: async (id) => {
    try {
      set({ loading: true, error: null });
      const data = await claimsAPI.getClaim(id);
      set({ selectedClaim: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createClaim: async (claim) => {
    try {
      set({ loading: true, error: null });
      const newClaim = await claimsAPI.createClaim(claim);
      set((state) => ({ claims: [newClaim, ...state.claims], loading: false }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateClaim: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const updated = await claimsAPI.updateClaim(id, updates);
      set((state) => ({
        claims: state.claims.map((c) => (c.id === id ? updated : c)),
        selectedClaim: state.selectedClaim?.id === id ? updated : state.selectedClaim,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  approveClaim: async (id) => {
    try {
      set({ loading: true, error: null });
      const updated = await claimsAPI.approveClaim(id);
      set((state) => ({
        claims: state.claims.map((c) => (c.id === id ? updated : c)),
        selectedClaim: state.selectedClaim?.id === id ? updated : state.selectedClaim,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  rejectClaim: async (id, reason) => {
    try {
      set({ loading: true, error: null });
      const updated = await claimsAPI.rejectClaim(id, reason);
      set((state) => ({
        claims: state.claims.map((c) => (c.id === id ? updated : c)),
        selectedClaim: state.selectedClaim?.id === id ? updated : state.selectedClaim,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteClaim: async (id) => {
    try {
      set({ loading: true, error: null });
      await claimsAPI.deleteClaim(id);
      set((state) => ({
        claims: state.claims.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  verifyOTP: async (claimId, otp) => {
    try {
      set({ loading: true, error: null });
      await claimsAPI.verifyOTP(claimId, otp);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setSelectedClaim: (claim) => set({ selectedClaim: claim }),
  clearError: () => set({ error: null }),
  reset: () => set({ claims: [], selectedClaim: null, loading: false, error: null }),
}));

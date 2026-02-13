import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Claim, ClaimStatus, Message } from '@/lib/types';
import { mockClaims, mockMessages } from '@/lib/mock-data';

interface ClaimsState {
  claims: Claim[];
  messages: Message[];
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt'>) => string;
  updateClaimStatus: (id: string, status: ClaimStatus, otp?: string) => void;
  getClaimById: (id: string) => Claim | undefined;
  getClaimsByItem: (itemId: string) => Claim[];
  getClaimsByUser: (userId: string) => Claim[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  getMessagesByClaim: (claimId: string) => Message[];
}

export const useClaimsStore = create<ClaimsState>()(
  persist(
    (set, get) => ({
      claims: mockClaims,
      messages: mockMessages,
      
      addClaim: (claim) => {
        const newClaim: Claim = {
          ...claim,
          id: `claim-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        set((state) => ({ claims: [...state.claims, newClaim] }));
        return newClaim.id;
      },
      
      updateClaimStatus: (id, status, otp) => {
        set((state) => ({
          claims: state.claims.map((claim) =>
            claim.id === id
              ? { ...claim, status, ...(otp && { otp }) }
              : claim
          ),
        }));
      },
      
      getClaimById: (id) => {
        return get().claims.find((claim) => claim.id === id);
      },
      
      getClaimsByItem: (itemId) => {
        return get().claims.filter((claim) => claim.itemId === itemId);
      },
      
      getClaimsByUser: (userId) => {
        return get().claims.filter((claim) => claim.claimantId === userId);
      },
      
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      },
      
      getMessagesByClaim: (claimId) => {
        return get().messages.filter((msg) => msg.claimId === claimId);
      },
    }),
    {
      name: 'claims-storage',
    }
  )
);

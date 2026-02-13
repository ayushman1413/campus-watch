import { create } from "zustand";
import { itemsAPI } from "@/lib/api/items";
import type { Item } from "@/lib/types";

interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
  selectedItem: Item | null;
  aiMatches: any[];
  
  // Main actions
  fetchItems: (filters?: any) => Promise<void>;
  fetchItem: (id: string) => Promise<void>;
  createItem: (item: any, userId: string) => Promise<void>;
  updateItem: (id: string, updates: any) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Search & Filter
  searchItems: (query: string) => Promise<void>;
  setSelectedItem: (item: Item | null) => void;
  
  // AI Features
  fetchAIMatches: (itemId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  loading: true,
  error: null,
  selectedItem: null,
  aiMatches: [],

  fetchItems: async (filters) => {
    try {
      set({ loading: true, error: null });
      const data = await itemsAPI.fetchItems(filters);
      set({ items: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchItem: async (id) => {
    try {
      set({ loading: true, error: null });
      const data = await itemsAPI.getItem(id);
      set({ selectedItem: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createItem: async (item, userId) => {
    try {
      set({ loading: true, error: null });
      const newItem = await itemsAPI.createItem(item, userId);
      set((state) => ({ items: [newItem, ...state.items], loading: false }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateItem: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const updated = await itemsAPI.updateItem(id, updates);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updated : item)),
        selectedItem: state.selectedItem?.id === id ? updated : state.selectedItem,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      set({ loading: true, error: null });
      await itemsAPI.deleteItem(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  searchItems: async (query) => {
    try {
      set({ loading: true, error: null });
      const data = await itemsAPI.searchItems(query);
      set({ items: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedItem: (item) => set({ selectedItem: item }),

  fetchAIMatches: async (itemId) => {
    try {
      const matches = await itemsAPI.getAIMatches(itemId);
      set({ aiMatches: matches.matched_items });
    } catch (error: any) {
      console.error("AI matching error:", error);
      set({ aiMatches: [] });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ items: [], loading: false, error: null, selectedItem: null, aiMatches: [] }),
}));

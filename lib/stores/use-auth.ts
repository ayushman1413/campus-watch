import { create } from "zustand";
import { supabase } from "@/lib/supabase/supabaseClient";

let authListener: any = null; // ⭐ prevent multiple listeners

interface AuthState {
  user: any | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  initAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

 initAuth: async () => {
  set({ loading: true });

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  set({ user });

  // ⭐ fetch profile if user exists
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    set({ profile });
  }

  set({ loading: false });

  // listener only once
  if (!authListener) {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        set({ user });

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          set({ profile });
        } else {
          set({ profile: null });
        }

        set({ loading: false });
      }
    );

    authListener = listener;
  }
},


  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

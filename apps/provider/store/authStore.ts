import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@travelhealthbridge/shared/api/supabase';
import { Provider } from '@travelhealthbridge/shared/types';
import { Platform } from 'react-native';

interface AuthState {
  session: any | null;
  provider: Provider | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: any | null) => void;
  loadProviderProfile: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      provider: null,
      isLoading: false,
      error: null,

      setSession: (session) => {
        set({ session, error: null });
        if (session?.user?.email) {
          get().loadProviderProfile(session.user.email);
        } else {
          set({ provider: null });
        }
      },

      loadProviderProfile: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('providers')
            .select('*')
            .eq('email', email)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
                set({ error: 'Not registered. Contact Travel Health Bridge at support@travelhealthbridge.com', provider: null });
            } else {
                set({ error: error.message, provider: null });
            }
            return;
          }

          if (data.badge_status === 'suspended') {
            set({ error: 'Account suspended. Please check your email for appeal instructions.', provider: null });
            return;
          }

          set({ provider: data, error: null });
        } catch (err: any) {
          set({ error: err.message, provider: null });
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, provider: null, error: null });
      },
    }),
    {
      name: 'thb-provider-auth',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (Platform.OS === 'web') return localStorage.getItem(name);
          return null; // Provider app is web only
        },
        setItem: (name, value) => {
           if (Platform.OS === 'web') localStorage.setItem(name, value);
        },
        removeItem: (name) => {
          if (Platform.OS === 'web') localStorage.removeItem(name);
        },
      })),
    }
  )
);

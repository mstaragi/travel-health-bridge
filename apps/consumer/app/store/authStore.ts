import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@travelhealthbridge/shared';

// Custom storage for Mobile (SecureStore) and Web (localStorage fallback)
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(name);
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
    } else {
      await SecureStore.setItemAsync(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
    } else {
      await SecureStore.deleteItemAsync(name);
    }
  },
};

interface AuthState {
  hasSeenOnboarding: boolean;
  isGuest: boolean;
  session: Session | null;
  isLoading: boolean;
  lockUntil: number | null; // Timestamp for 15-min lockout
  
  // Actions
  completeOnboarding: () => Promise<void>;
  setGuestMode: (guest: boolean) => void;
  setLockout: (minutes: number) => Promise<void>;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  hasSeenOnboarding: false,
  isGuest: false,
  session: null,
  isLoading: true,
  lockUntil: null,

  completeOnboarding: async () => {
    await secureStorage.setItem('hasSeenOnboarding', 'true');
    set({ hasSeenOnboarding: true });
  },

  setGuestMode: (guest) => {
    set({ isGuest: guest });
  },

  setLockout: async (minutes) => {
    const timestamp = Date.now() + minutes * 60 * 1000;
    await secureStorage.setItem('lockUntil', timestamp.toString());
    set({ lockUntil: timestamp });
  },

  initialize: async () => {
    try {
      const [hasSeen, lockTimestamp] = await Promise.all([
        secureStorage.getItem('hasSeenOnboarding'),
        secureStorage.getItem('lockUntil'),
      ]);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if lockout has expired
      let lockUntil = lockTimestamp ? parseInt(lockTimestamp) : null;
      if (lockUntil && lockUntil < Date.now()) {
        lockUntil = null;
        await secureStorage.removeItem('lockUntil');
      }

      set({ 
        hasSeenOnboarding: hasSeen === 'true', 
        session,
        lockUntil
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, isGuest: false });
      });
    } catch (e) {
      console.error('Failed to initialize auth store:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, isGuest: false });
  }
}));

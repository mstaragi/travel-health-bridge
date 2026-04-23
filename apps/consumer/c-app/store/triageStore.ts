import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import { Provider } from '@travelhealthbridge/shared/types';

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') return AsyncStorage.getItem(name);
    const SecureStore = require('expo-secure-store');
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') return AsyncStorage.setItem(name, value);
    const SecureStore = require('expo-secure-store');
    return SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(name);
    const SecureStore = require('expo-secure-store');
    return SecureStore.deleteItemAsync(name);
  },
};

export type UrgencyLevel = 'emergency' | 'urgent' | 'can_wait' | null;

interface TriageState {
  city: string | null;
  urgency: UrgencyLevel;
  languages: string[];
  symptom: string | null;
  budget: string | null;
  whatsappNumber: string | null;
  sessionToken: string;
  result: Provider[] | null;
  callNowTappedAt: number | null;
  
  // Actions
  setUrgency: (u: UrgencyLevel) => void;
  setCity: (c: string) => void;
  setLanguages: (langs: string[]) => void;
  setSymptom: (s: string) => void;
  setBudget: (b: string) => void;
  setWhatsappNumber: (num: string) => void;
  setResult: (res: Provider[]) => void;
  setCallNowTappedAt: (timestamp: number) => void;
  resetSession: () => void;
}

export const useTriageStore = create<TriageState>()(
  persist(
    (set) => ({
      city: null,
      urgency: null,
      languages: [],
      symptom: null,
      budget: null,
      whatsappNumber: null,
      sessionToken: nanoid(),
      result: null,
      callNowTappedAt: null,

      setUrgency: (urgency) => set({ urgency }),
      setCity: (city) => set({ city }),
      setLanguages: (languages) => set({ languages }),
      setSymptom: (symptom) => set({ symptom }),
      setBudget: (budget) => set({ budget }),
      setWhatsappNumber: (whatsappNumber) => set({ whatsappNumber }),
      setResult: (result) => set({ result }),
      setCallNowTappedAt: (callNowTappedAt) => set({ callNowTappedAt }),
      
      resetSession: () => set({
        city: null,
        urgency: null,
        languages: [],
        symptom: null,
        budget: null,
        whatsappNumber: null,
        sessionToken: nanoid(),
        result: null,
        callNowTappedAt: null,
      }),
    }),
    {
      name: 'thb-triage-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

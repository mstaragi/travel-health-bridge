import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments, useLocalSearchParams, Redirect, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from 'store/authStore';
import { View, ActivityIndicator, Platform } from 'react-native';
import { palette } from '@travelhealthbridge/shared/ui/tokens';
import { ConsentModal } from '@travelhealthbridge/shared/ui/ConsentModal';
import * as SecureStore from 'expo-secure-store';
import { posthog } from 'lib/analytics';
import { track } from '@travelhealthbridge/shared';
import React from 'react';

// Platform-aware PostHogProvider
let PostHogProvider: any = ({ children }: any) => <>{children}</>;
if (Platform.OS !== 'web') {
  try {
    PostHogProvider = require('posthog-react-native').PostHogProvider;
  } catch (e) {
    // Fallback to fragment on failure
  }
}

import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@travelhealthbridge/shared/ui/useTheme';

const STORAGE = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  }
};

export default function RootLayout() {
  const { isLoading, hasSeenOnboarding, session, isGuest, initialize } = useAuthStore();
  const [showConsent, setShowConsent] = useState(false);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // NUCLEAR SW PURGE: Unregister EVERY service worker on this origin to prevent cross-port hijacking
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('[NUCLEAR-SW-PURGE] Purged service worker to prevent origin hijacking');
        }
      });
    }

    const checkConsent = async () => {
      await initialize();
      const consent = await STORAGE.getItem('consent_given');
      if (consent !== 'true') {
        setShowConsent(true);
      }
    };
    checkConsent();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      track('app_opened', { 
        source: params.utm_source || 'organic',
        is_guest: isGuest
      });
    }
  }, [isLoading]);

  const handleConsent = async () => {
    await STORAGE.setItem('consent_given', 'true');
    setShowConsent(false);
  };

  // [ABSOLUTE PATH GATING] 
  // Use window.location.pathname directly for 100% accuracy, bypassing router segment lag.
  const currentUrlPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
  
  // [WHITELIST-ONLY PROTECTION]
  const protectedPaths = ['profile', 'vault', 'visits', 'settings'];
  const isProtectedPath = protectedPaths.some(p => currentUrlPath.toLowerCase().includes(p));

  // [DEFINITIVE PUBLIC TRIAGE BYPASS]
  // This is the CRITICAL SYNC OVERRIDE. If we are in the triage flow, we PHYSICALLY SKIP all auth gating.
  const isPublicAssessment = 
    currentUrlPath.includes('step') || 
    currentUrlPath.includes('triage') || 
    currentUrlPath.includes('result') || 
    currentUrlPath === '/' || 
    currentUrlPath === '';

  const shouldRedirectToAuth = isProtectedPath && !isPublicAssessment && !session && !isGuest;

  if (__DEV__) {
    console.log(`[ROUTING-SHIELD] Path: "${currentUrlPath}" | Public Assessment: ${isPublicAssessment} | Should Gate: ${shouldRedirectToAuth}`);
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.navy[900] }}>
        <ActivityIndicator size="large" color={palette.teal[400]} />
      </View>
    );
  }

  // [HARDENED AUTH GATE]
  if (shouldRedirectToAuth) {
    return <Redirect href="/auth/phone" />;
  }

  // [AUTH BYPASS] Don't linger on auth screens if signed in
  if ((session || isGuest) && currentUrlPath.includes('/auth/')) {
    return <Redirect href="/" />;
  }

  return (
    <PostHogProvider client={posthog}>
      <StatusBar style="light" />
      <Slot />
      <ConsentModal visible={showConsent} onAccept={handleConsent} />
    </PostHogProvider>
  );
}

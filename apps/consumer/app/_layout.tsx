import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from 'store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { palette } from '@travelhealthbridge/shared/ui/tokens';
import { ConsentModal } from '@travelhealthbridge/shared/ui/ConsentModal';
import * as SecureStore from 'expo-secure-store';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from 'lib/analytics';
import { track } from '@travelhealthbridge/shared';
import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '../packages/shared/ui/useTheme';

export default function RootLayout() {
  const { isLoading, hasSeenOnboarding, session, isGuest, initialize } = useAuthStore();
  const [showConsent, setShowConsent] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const checkConsent = async () => {
      await initialize();
      const consent = await SecureStore.getItemAsync('consent_given');
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
    await SecureStore.setItemAsync('consent_given', 'true');
    setShowConsent(false);
  };

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const isEmergency = segments[segments.length - 1] === 'emergency' || segments[0] === '(tabs)' && segments[1] === 'emergency';

    // Emergency screen is NEVER gated
    if (isEmergency) return;

    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasSeenOnboarding) {
      if (!session && !isGuest && !inAuthGroup) {
        router.replace('/auth/phone');
      } else if ((session || isGuest) && (inAuthGroup || inOnboarding)) {
        router.replace('/');
      }
    }
  }, [isLoading, hasSeenOnboarding, session, isGuest, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.navy[900] }}>
        <ActivityIndicator size="large" color={palette.teal[400]} />
      </View>
    );
  }

  return (
    <PostHogProvider client={posthog}>
      <StatusBar style="light" />
      <Slot />
      <ConsentModal visible={showConsent} onAccept={handleConsent} />
    </PostHogProvider>
  );
}



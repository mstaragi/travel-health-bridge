/**
 * ProtectedLayout — Route protection middleware component
 *
 * Ensures user is authenticated and has completed onboarding before accessing tabs.
 * Redirects to /(auth)/phone if not authenticated
 * Redirects to /(auth)/onboarding if not onboarded
 */
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { palette } from '@travelhealthbridge/shared/ui/tokens';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const { session, hasSeenOnboarding, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    // No session = redirect to phone auth
    if (!session) {
      router.replace('/(auth)/phone');
      return;
    }

    // Session but no onboarding = redirect to onboarding
    if (!hasSeenOnboarding) {
      router.replace('/(auth)/onboarding');
      return;
    }

    // Authenticated + onboarded = allow access
  }, [session, hasSeenOnboarding, isLoading]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: palette.navy[900],
        }}
      >
        <ActivityIndicator size="large" color={palette.teal[400]} />
      </View>
    );
  }

  // Not authenticated = show nothing (redirected above)
  if (!session) {
    return null;
  }

  // Return children (protected content)
  return <>{children}</>;
}

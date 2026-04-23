import React, { useEffect } from 'react';
import { Redirect, Slot, usePathname } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { palette } from '@travelhealthbridge/shared/ui';

export default function ProtectedLayout({ children }: { children?: React.ReactNode }) {
  const { session, provider, isLoading } = useAuthStore();
  const pathname = usePathname();

  // 1. Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={palette.teal[600]} />
      </View>
    );
  }

  // 2. Auth Gate: If not authenticated, redirect to login
  // We check for session + provider profile completeness
  if (!session || !provider) {
    if (__DEV__) {
        console.log(`[AUTH-GATE] Protecting segment at "${pathname}". Redirecting to /auth/login`);
    }
    return <Redirect href="/auth/login" />;
  }

  return children || <Slot />;
}

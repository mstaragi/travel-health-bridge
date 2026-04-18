import React, { useEffect } from 'react';
import { Redirect, Slot, usePathname } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { palette } from '@travelhealthbridge/shared/ui/tokens';

export default function ProtectedLayout() {
  const { session, isGuest, isLoading } = useAuthStore();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.navy[900] }}>
        <ActivityIndicator size="large" color={palette.teal[400]} />
      </View>
    );
  }

  // If not authenticated and not a guest, redirect to phone auth
  if (!session && !isGuest) {
    if (__DEV__) {
      console.log(`[AUTH-GATE] Protecting segment at "${pathname}". Redirecting to /auth/phone`);
    }
    return <Redirect href="/auth/phone" />;
  }

  return <Slot />;
}

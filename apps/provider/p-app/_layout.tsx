import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@travelhealthbridge/shared/ui/useTheme';
import { View, ActivityIndicator } from 'react-native';
import { palette } from '@travelhealthbridge/shared/ui/tokens';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/**
 * Travel Health Bridge Provider PWA — Root Layout
 * Provides safety-critical context (Safe Area, Theme, Gestures) to all operational components.
 */
export default function RootLayout() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Basic boot sequence — allow system fonts and styles to settle
    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.gray[50] }}>
         <ActivityIndicator size="large" color={palette.teal[600]} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

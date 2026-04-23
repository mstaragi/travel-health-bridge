import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Travel Health Bridge Provider PWA — Root Layout
 * Scaffold only. Full navigation built in Prompt 9.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}

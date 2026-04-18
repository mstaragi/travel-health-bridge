import { Redirect } from 'expo-router';

/**
 * Provider app index — redirects to gallery for component verification.
 * In production, this redirects to /(dashboard).
 */
export default function IndexScreen() {
  return <Redirect href="/(dashboard)" />;
}

/**
 * useTheme — dark/light mode hook
 * Returns current theme token set based on device colour scheme.
 */
import { useColorScheme as useRNColorScheme } from 'react-native';
import { lightTheme, darkTheme, type Theme } from './tokens';

export function useTheme(): { theme: Theme; isDark: boolean } {
  const scheme = useRNColorScheme();
  const isDark = scheme === 'dark';
  return { theme: isDark ? darkTheme : lightTheme, isDark };
}

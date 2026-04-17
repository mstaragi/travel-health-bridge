import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || 'phc_placeholder_replace_before_production';

export const analytics = new PostHog(POSTHOG_API_KEY, {
  host: 'https://app.posthog.com',
  enable: !__DEV__
});

/**
 * Global track helper for all 28 events.
 * Automatically injects app version and platform.
 */
export const track = (event: string, props?: Record<string, unknown>) => {
  analytics.capture(event, {
    ...props,
    app_version: Constants.expoConfig?.version || '1.0.0',
    platform: Platform.OS,
    is_pwa: Platform.OS === 'web',
  });
};

/**
 * Identify user on auth.
 */
export const identify = (userId: string, traits?: Record<string, unknown>) => {
  analytics.identify(userId, traits);
};

/**
 * Reset on logout.
 */
export const resetAnalytics = () => {
  analytics.reset();
};

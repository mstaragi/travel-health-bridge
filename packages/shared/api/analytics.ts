import Constants from 'expo-constants';

// Platform shim to avoid 'react-native' leak
const isWeb = typeof window !== 'undefined' || (typeof process !== 'undefined' && process.versions?.node);
const Platform = { OS: isWeb ? 'web' : 'ios' };

// PostHog Shim for Web/Admin Console
class PostHogStub {
  capture(event: string, props?: any) { console.log(`[Analytics Stub] Capture: ${event}`, props); }
  identify(id: string, traits?: any) { console.log(`[Analytics Stub] Identify: ${id}`, traits); }
  reset() { console.log(`[Analytics Stub] Reset`); }
}

let PostHog: any = PostHogStub;

// Only load native PostHog on mobile (standard RN doesn't define 'window')
if (typeof window === 'undefined' && !isWeb) {
  try {
    PostHog = require('posthog-react-native').default;
  } catch (e) {
    PostHog = PostHogStub;
  }
}

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || 'phc_placeholder_replace_before_production';

export const analytics = new PostHog(POSTHOG_API_KEY, {
  host: 'https://app.posthog.com',
  enable: process.env.NODE_ENV === 'production'
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

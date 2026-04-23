import { database } from '../db';
import { TABLES } from '@travelhealthbridge/shared/api/supabase';
import { Platform } from 'react-native';

// PostHog Shim for Consumer Web
class PostHogStub {
  capture(event: string, props?: any) { console.log(`[Consumer Analytics Stub] Capture: ${event}`, props); }
  identify(id: string, traits?: any) { console.log(`[Consumer Analytics Stub] Identify: ${id}`, traits); }
  reset() { console.log(`[Consumer Analytics Stub] Reset`); }
}

let PostHogModule: any = PostHogStub;

// Only load native PostHog on mobile (ensure we don't even try to require it on web)
if (typeof window === 'undefined' && Platform.OS !== 'web') {
  try {
    // We use a dynamic require to keep it hidden from static analysis where possible
    const NativePostHog = require('posthog-react-native').default;
    PostHogModule = NativePostHog || PostHogStub;
  } catch (e) {
    PostHogModule = PostHogStub;
  }
}

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || 'phc_placeholder_replace_before_production';

export const posthog = new PostHogModule(POSTHOG_API_KEY, {
  host: 'https://app.posthog.com',
  enable: process.env.NODE_ENV === 'production',
});

interface SOSPayload {
  city: string;
  latitude?: number;
  longitude?: number;
  blood_group?: string | null;
  known_allergies?: boolean;
  has_emergency_contact?: boolean;
  vault_completion_pct?: number;
}

/**
 * logSOS
 * Dispatch SOS event to PostHog and queue in WatermelonDB for Supabase sync
 */
export async function logSOS(payload: SOSPayload) {
  // 1. PostHog (Immediate/Queued by SDK)
  posthog.capture('sos_triggered', {
    ...payload,
    platform: process.env.EXPO_OS,
    timestamp: new Date().toISOString(),
  });

  // 2. Local DB (For manual/sync-based Supabase pushing)
  try {
    await database.write(async () => {
      await database.get('unsynced_events').create((record: any) => {
        record.eventName = 'sos_triggered';
        record.payloadJson = JSON.stringify(payload);
        record.createdAt = Date.now();
      });
    });
  } catch (err) {
    console.error('Failed to queue SOS event locally:', err);
  }
}

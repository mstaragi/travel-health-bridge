import PostHog from 'posthog-react-native';
import { database } from '../db';
import { TABLES } from '@travelhealthbridge/shared/api/supabase';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || 'phc_placeholder_replace_before_production';

export const posthog = new PostHog(POSTHOG_API_KEY, {
  host: 'https://app.posthog.com',
  enable: !__DEV__, // Only fire in production per instruction
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

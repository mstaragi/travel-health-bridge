/**
 * Travel Health Bridge — Supabase Client
 * Stub implementation — credentials loaded from environment variables.
 * React Query hooks stubs included for all tables.
 * Full implementation happens per-prompt as each feature is built.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mock-ur.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Travel Health Bridge] Supabase environment variables not set. ' +
      'Copy .env.local.template to .env.local and fill in your credentials.'
  );
}

const customStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return Promise.resolve(null);
      return Promise.resolve(window.localStorage.getItem(key));
    }
    const SecureStore = require('expo-secure-store');
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return Promise.resolve(undefined);
      return Promise.resolve(window.localStorage.setItem(key, value));
    }
    const SecureStore = require('expo-secure-store');
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return Promise.resolve(undefined);
      return Promise.resolve(window.localStorage.removeItem(key));
    }
    const SecureStore = require('expo-secure-store');
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── Table names (single source of truth) ─────────────────────

export const TABLES = {
  PROVIDERS: 'providers',
  TRIAGE_SESSIONS: 'triage_sessions',
  FEEDBACK: 'feedback',
  WHATSAPP_CASES: 'whatsapp_cases',
  OFFLINE_PROVIDERS: 'offline_providers',
  VAULT: 'vault',
  PROVIDER_AVAILABILITY: 'provider_availability',
  USER_PROFILES: 'user_profiles',
  OVERCHARGE_REPORTS: 'overcharge_reports',
  EMERGENCY_CACHE: 'emergency_cache',
  CITY_WAITLIST: 'city_waitlist',
  NOTIFICATION_LOG: 'notification_log',
  ADVISORIES: 'advisories',
  REVIEW_FLAGS: 'review_flags',
  PROVIDER_NO_ANSWER: 'provider_no_answer_events',
} as const;

// ── React Query key factory ───────────────────────────────────

export const queryKeys = {
  providers: {
    all: ['providers'] as const,
    byCity: (cityId: string) => ['providers', 'city', cityId] as const,
    bySlug: (slug: string) => ['providers', 'slug', slug] as const,
    search: (query: string, filters: Record<string, unknown>) =>
      ['providers', 'search', query, filters] as const,
  },
  triage: {
    session: (id: string) => ['triage_session', id] as const,
    recent: ['triage_sessions', 'recent'] as const,
  },
  feedback: {
    bySession: (sessionId: string) => ['feedback', sessionId] as const,
  },
  vault: {
    byUser: (userId: string) => ['vault', userId] as const,
  },
  emergency: {
    cache: (city: string) => ['emergency_cache', city] as const,
  },
  admin: {
    dailySummary: ['admin', 'daily_summary'] as const,
    sessions: (filters: Record<string, unknown>) =>
      ['admin', 'sessions', filters] as const,
    overcharges: ['admin', 'overcharges'] as const,
    cases: ['admin', 'cases'] as const,
    providers: (filters: Record<string, unknown>) =>
      ['admin', 'providers', filters] as const,
    advisories: ['admin', 'advisories'] as const,
  },
} as const;

// ── Stub hooks (to be implemented per prompt) ─────────────────
// These are placeholders so imports don't break during scaffold.
// Each will be replaced with full implementations in the relevant prompt.

/** Stub — implemented in Prompt 5 */
export function useProviders(_cityId: string) {
  return { data: [], isLoading: false, error: null };
}

/** Stub — implemented in Prompt 4 */
export function useTriageSession(_sessionId: string) {
  return { data: null, isLoading: false, error: null };
}

/** Stub — implemented in Prompt 7 */
export function useVault(_userId: string) {
  return { data: null, isLoading: false, error: null };
}

/** Stub — implemented in Prompt 6 */
export function useEmergencyCache(_city: string) {
  return { data: [], isLoading: false, error: null };
}

/** Implements Prompt 10 — Admin Dashboard Summary */
export function useAdminDailySummary() {
  return useQuery({
    queryKey: queryKeys.admin.dailySummary,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [sessions, gaps, overcharges, cases, stale] = await Promise.all([
        supabase
          .from(TABLES.TRIAGE_SESSIONS)
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today),
        supabase
          .from('non_covered_city_events') // Not in TABLES constant yet
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today),
        supabase
          .from(TABLES.OVERCHARGE_REPORTS)
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Open'),
        supabase
          .from(TABLES.WHATSAPP_CASES)
          .select('*', { count: 'exact', head: true })
          .in('status', ['Open', 'In Progress'])
          .in('severity', ['P1', 'P2']),
        supabase
          .from(TABLES.PROVIDERS)
          .select('*', { count: 'exact', head: true })
          .in('staleness_tier', ['stale', 'very_stale']),
      ]);

      return {
        triage_sessions_today: sessions.count ?? 0,
        non_covered_hits_today: gaps.count ?? 0,
        open_overcharges: overcharges.count ?? 0,
        open_p1_p2_cases: cases.count ?? 0,
        stale_providers_count: stale.count ?? 0,
      };
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes polling per Prompt 10
  });
}

/** Implements Prompt 10 — Admin Sessions Monitor */
export function useAdminSessions(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: queryKeys.admin.sessions(filters),
    queryFn: async () => {
      let query = supabase
        .from(TABLES.TRIAGE_SESSIONS)
        .select(`
          *,
          feedback (*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filters.city) query = query.eq('city_id', filters.city);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

/** Implements Prompt 10 — Admin Overcharge Queue */
export function useAdminOvercharges() {
  return useQuery({
    queryKey: queryKeys.admin.overcharges,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.OVERCHARGE_REPORTS)
        .select(`
          *,
          provider:provider_id (name, fee_opd),
          session:session_id (prior_recommendation_source)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

/** Implements Prompt 10 — Admin Providers List */
export function useAdminProviders(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: queryKeys.admin.providers(filters),
    queryFn: async () => {
      let query = supabase.from(TABLES.PROVIDERS).select('*');

      if (filters.city) query = query.eq('city_id', filters.city);
      if (filters.badge_status) query = query.eq('badge_status', filters.badge_status);
      if (filters.staleness_tier) query = query.eq('staleness_tier', filters.staleness_tier);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

/** Implements Prompt 10 — Admin WhatsApp Cases */
export function useAdminCases(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: queryKeys.admin.cases,
    queryFn: async () => {
      let query = supabase
        .from(TABLES.WHATSAPP_CASES)
        .select('*')
        .order('opened_at', { ascending: false });

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.severity) query = query.eq('severity', filters.severity);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

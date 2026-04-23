/**
 * Travel Health Bridge Shared Package — Main Entry Point
 * Re-exports all types, utils, constants, and API.
 */

// Types
export * from './types';

// Hooks
export { usePhoneAuth } from './hooks';
export type { } from './hooks';

// Utils
export { haversineDistance } from './utils/distance';
export { isOpenNow } from './utils/openStatus';
export type { OpenStatus } from './utils/openStatus';
export { formatFeeRange } from './utils/formatFee';
export { computeStalenessTier } from './utils/staleness';
export type { StalenessTier } from './utils/staleness';
export { rankProviders } from './utils/rankProviders';
export { computeReliabilityScore } from './utils/reliability';
export { isQuietHoursIST, toISTString } from './utils/time';

// Constants
export {
  CITIES,
  LANGUAGES,
  SPECIALTIES,
  SYMPTOM_TO_CLUSTER,
  SYMPTOM_TO_SPECIALTY,
  OFFLINE_CACHE_CLUSTERS,
  NON_COVERED_CITY_CHECKLIST,
  NATIONAL_EMERGENCY_NUMBERS,
  WHATSAPP_CASE_CATEGORIES,
  HELPLINE_WHATSAPP_NUMBER,
  HELPLINE_OPERATING_HOURS,
  CITY_IDS,
} from './constants';
export type { CityDefinition, EmergencyContact as CityEmergencyContact, Language, Specialty, OfflineCacheCluster, WhatsappCaseCategory } from './constants';

// API
export { supabase, queryKeys, TABLES } from './api/supabase';
export { analytics, track, identify, resetAnalytics } from './api/analytics';

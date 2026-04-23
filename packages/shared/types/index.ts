// ============================================================
// Travel Health Bridge — Shared TypeScript Interfaces
// Single source of truth for all data shapes.
// Supersedes all previous type definitions.
// ============================================================

// ── Provider ─────────────────────────────────────────────────

export interface Doctor {
  name: string;
  qualification: string;
  specialty: string;
}

export interface OpdHours {
  /** Day key: 'monday'|'tuesday'|...'sunday' */
  [day: string]: {
    open: boolean;
    from: string; // "09:00"
    to: string;   // "21:00"
  };
}

export interface FeeRange {
  min: number;
  max: number;
}

export interface Provider {
  id: string;
  slug: string;
  name: string;
  email: string;        // added for provider app auth
  city_id: string;        // matches CITIES constant key
  area: string;
  address: string;
  lat?: number;
  lng?: number;
  phone: string;
  photo_url?: string;
  languages: string[];    // from LANGUAGES constant
  specialties: string[];  // from SPECIALTIES constant
  doctors: Doctor[];
  opd_hours: OpdHours;
  fee_opd: FeeRange;
  fee_specialist?: FeeRange;
  emergency: boolean;     // true if capable of emergency handling
  badge_status: 'active' | 'suspended' | 'expired';
  badge_date: string;     // ISO date string — verification date
  badge_expiry: string;   // ISO date string
  last_activity_at: string; // ISO date string — used for staleness
  staleness_tier: 'fresh' | 'stale' | 'very_stale' | 'lapsed';
  strike_count: number;
  about?: string;         // 200 chars max
  verified: boolean;
  // Computed from feedback (populated by admin or edge function)
  reliability_score?: number; // 0-2 pts, null if < 5 feedback records
}

// ── TriageSession ─────────────────────────────────────────────

export type UrgencyLevel = 'emergency' | 'urgent' | 'can_wait';

export interface TriageSession {
  id: string;              // nanoid
  user_id?: string;        // null for guests
  guest_session_token?: string;
  city_id: string;
  urgency: UrgencyLevel;
  languages: string[];
  symptom: string;         // key from SYMPTOM_TO_CLUSTER
  budget_max: number;
  recommended_provider_id?: string;
  secondary_provider_id?: string;
  source: 'triage' | 'search' | 'emergency';
  // displacement tracking
  prior_recommendation_source?: string;
  // user-alone flow
  emergency_contact_notified_at?: string;
  call_now_tapped_at?: string;
  // notification
  feedback_sent: boolean;
  created_at: string;
  // offline detection
  was_offline: boolean;
}

// ── Feedback ──────────────────────────────────────────────────
// AMENDED per Amendment 1 — True Final Spec
// All fields exactly as required for displacement formula

export type LanguageComfort = 'yes' | 'partial' | 'no';
export type ReuseIntent = 'yes' | 'no' | 'maybe';
export type CostAccurate = 'yes' | 'no' | 'not_sure';

export interface Feedback {
  id: string;
  session_id: string;        // links to TriageSession
  user_id?: string;
  // Step 0 — MANDATORY — displacement capture
  prior_recommendation_source: string;
  // 'Hotel or guesthouse reception' | 'Google Maps or internet search' |
  // 'A friend or local person' | 'My insurance helpline' |
  // 'No — Travel Health Bridge was my first step'
  // Step 1
  visited: boolean;
  // Step 1b — true displacement field
  visited_recommended_provider: boolean | null;
  // Step 2 (only if visited_recommended_provider = true)
  cost_accurate: CostAccurate | null;
  // Step 3 (only if visited_recommended_provider = true)
  star_rating: number | null; // 1-5
  // Step 4 (only if visited_recommended_provider = true)
  language_comfort: LanguageComfort | null;
  // Step 5
  reuse_intent: ReuseIntent | null;
  // Step 6
  notes?: string;            // 200 chars max
  // Meta
  submitted_at: string;
}

// ── WhatsappCase ──────────────────────────────────────────────
// AMENDED per Amendment 2 — Lightweight case logging

export type CaseSeverity = 'P1' | 'P2' | 'P3' | 'P4';
export type CaseStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface WhatsappCase {
  id: string;                // THB-YYYYMMDD-sequential
  severity: CaseSeverity;
  category: string;          // one of 8 chip options
  status: CaseStatus;
  owner: string;             // ops user id/name — defaults to current user
  opened_at: string;         // ISO timestamp — auto-set on quick log
  resolved_at?: string;
  city_id?: string;
  session_id?: string;       // linked triage session (enriched later)
  provider_id?: string;      // linked provider (enriched later)
  escalation_to?: string;
  notes?: string;
  resolution_notes?: string;
  outcome?: string;
  pattern_flag?: boolean;    // flagged during daily review
}

// ── OfflineProvider ───────────────────────────────────────────

export interface OfflineProvider {
  id: string;
  provider_id: string;
  city: string;
  symptom_cluster: string;   // from OFFLINE_CACHE_CLUSTERS
  provider_name: string;
  provider_phone: string;
  provider_address: string;
  provider_open_status: 'open' | 'closed' | 'unconfirmed';
  languages: string[];
  fee_opd_min: number;
  fee_opd_max: number;
  emergency: boolean;
  last_synced_at: string;    // ISO timestamp — shown to user as cache age
}

// ── VaultEntry ────────────────────────────────────────────────

export interface Medication {
  name: string;
  dosage: string;
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'as_needed';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface VaultEntry {
  id: string;
  user_id: string;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown' | null;
  allergies: string[];          // max 20
  medications: Medication[];    // max 10
  emergency_contacts: EmergencyContact[]; // max 2
  // Insurance — 2 fields ONLY (Layer 3 deferred)
  insurer_name?: string;        // 50 chars max
  insurer_helpline?: string;    // phone number
  last_synced_at: string;
}

// ── Profile ───────────────────────────────────────────────────

export interface Profile {
  id: string;
  phone: string;
  full_name?: string;
  consent_given: boolean;
  avatar_url?: string;
  created_at: string;
}

// ── ProviderAvailability ──────────────────────────────────────

export type AvailabilityStatus = 'available' | 'busy';

export interface ProviderAvailability {
  id: string;
  provider_id: string;
  status: AvailabilityStatus;
  available_from?: string; // ISO time — set when status='busy'
  updated_at: string;      // CRITICAL: must update < 1s via Supabase
}

// ── Shared utility types ──────────────────────────────────────

export interface City {
  id: string;
  name: string;
  state: string;
  emergency_hospital: string;
  emergency_phone: string;
  ambulance?: string;
}

export interface RankProvidersResult {
  primary: Provider | null;
  secondary: Provider | null;
  showHelplineCTA: boolean;  // true when < 2 providers score above 0
}

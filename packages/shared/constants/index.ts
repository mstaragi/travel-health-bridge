/**
 * Travel Health Bridge — Shared Constants
 * Single source of truth for all hardcoded data.
 * All strings are canonical. Do not change without updating locales.
 */

// ── CITIES — 6 covered cities with hardcoded emergency contacts ──────────────
// Exact per spec Section 03, Prompt 1, EMERGENCY_CONTACTS block.
// These must NEVER require an API call — always available offline.

export interface EmergencyContact {
  hospital: string;
  phone: string;
  ambulance?: string;
}

export interface CityDefinition {
  id: string;        // internal key used across the app
  name: string;      // display name
  state: string;
  lat: number;
  lng: number;
  emergency: EmergencyContact;
}

export const CITIES: CityDefinition[] = [
  {
    id: 'delhi',
    name: 'Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    emergency: {
      hospital: 'AIIMS Emergency',
      phone: '011-26588500',
      ambulance: '102',
    },
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    emergency: {
      hospital: 'Bowring Hospital Emergency',
      phone: '080-25371271',
    },
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    emergency: {
      hospital: 'KEM Hospital Emergency',
      phone: '022-24107000',
    },
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    lat: 15.4909,
    lng: 73.8278,
    emergency: {
      hospital: 'GMC Emergency',
      phone: '0832-2458727',
    },
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    emergency: {
      hospital: 'SMS Hospital Emergency',
      phone: '0141-2518375',
    },
  },
  {
    id: 'agra',
    name: 'Agra',
    state: 'Uttar Pradesh',
    lat: 27.1767,
    lng: 78.0081,
    emergency: {
      hospital: 'SN Medical College Emergency',
      phone: '0562-2600150',
    },
  },
];

export const CITY_IDS = CITIES.map((c) => c.id);

// ── LANGUAGES — per spec, exactly these values ───────────────────────────────

export const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Bengali', 'Other'] as const;
export type Language = typeof LANGUAGES[number];

// ── SPECIALTIES ───────────────────────────────────────────────────────────────

export const SPECIALTIES = [
  'General Physician',
  'Travel Medicine',
  'Gastroenterology',
  'Infectious Disease',
  'Dermatology',
  'Orthopedics',
  'Cardiology',
  'Respiratory Medicine',
  'ENT',
  'Neurology',
  'Ophthalmology',
  'Gynecology',
  'Pediatrics',
  'Psychiatry',
  'Emergency Medicine',
] as const;
export type Specialty = typeof SPECIALTIES[number];

// ── SYMPTOM_TO_CLUSTER — maps symptom id to cache cluster key ─────────────────

export const SYMPTOM_TO_CLUSTER: Record<string, string> = {
  fever: 'fever_infection',
  chills: 'fever_infection',
  body_ache: 'fever_infection',
  stomach_pain: 'gi_digestive',
  nausea: 'gi_digestive',
  vomiting: 'gi_digestive',
  diarrhea: 'gi_digestive',
  food_poisoning: 'gi_digestive',
  cold: 'respiratory',
  cough: 'respiratory',
  sore_throat: 'respiratory',
  breathlessness: 'respiratory',
  cut: 'injury_pain',
  bruise: 'injury_pain',
  sprain: 'injury_pain',
  muscle_pain: 'injury_pain',
  rash: 'skin_allergy',
  insect_bite: 'skin_allergy',
  allergic_reaction: 'skin_allergy',
  chest_pain: 'cardiac_emergency',
  palpitations: 'cardiac_emergency',
  headache: 'head_neuro',
  migraine: 'head_neuro',
  dizziness: 'head_neuro',
  other: 'general',
};

// ── OFFLINE_CACHE_CLUSTERS — 7 clusters for WatermelonDB caching ─────────────

export const OFFLINE_CACHE_CLUSTERS = [
  'fever_infection',
  'gi_digestive',
  'respiratory',
  'injury_pain',
  'skin_allergy',
  'cardiac_emergency',
  'head_neuro',
  'general',
] as const;
export type OfflineCacheCluster = typeof OFFLINE_CACHE_CLUSTERS[number];

// ── SYMPTOM_TO_SPECIALTY — for specialty match bonus in rankProviders() ────────

export const SYMPTOM_TO_SPECIALTY: Record<string, string[]> = {
  fever: ['General Physician', 'Infectious Disease', 'Travel Medicine'],
  fever_infection: ['General Physician', 'Infectious Disease', 'Travel Medicine'],
  stomach_pain: ['General Physician', 'Gastroenterology'],
  gi_digestive: ['General Physician', 'Gastroenterology'],
  cough: ['General Physician', 'Respiratory Medicine', 'ENT'],
  respiratory: ['General Physician', 'Respiratory Medicine', 'ENT'],
  injury_pain: ['General Physician', 'Orthopedics'],
  rash: ['Dermatology', 'General Physician'],
  skin_allergy: ['Dermatology', 'General Physician'],
  chest_pain: ['Cardiology', 'Emergency Medicine'],
  cardiac_emergency: ['Cardiology', 'Emergency Medicine'],
  headache: ['Neurology', 'General Physician'],
  dizziness: ['Neurology', 'General Physician'],
  head_neuro: ['Neurology', 'General Physician'],
  general: ['General Physician', 'Travel Medicine'],
};

// ── NON_COVERED_CITY_CHECKLIST — exact 6 strings, hardcoded, cached offline ──
// Item [0] UPDATED per Section 02, Improvement 1 to include specific red-flag symptoms.

export const NON_COVERED_CITY_CHECKLIST: string[] = [
  'If you have chest pain, difficulty breathing, persistent vomiting, fainting or loss of consciousness, severe dehydration (cannot keep water down), head injury, serious bleeding, or rapidly worsening symptoms: go directly to a government hospital emergency department, not a clinic. Do not wait.',
  'Look for clinics with 24-hour or Emergency in the name.',
  'Call 102 (ambulance) if you cannot move safely.',
  'Ask hotel reception for the nearest hospital by name, then verify it on Google Maps before going.',
  'Share your location with someone you trust before leaving.',
  'Message us — we help manually even without a verified provider in your city. We respond within 3 minutes (8am-11pm IST).',
];

// ── NATIONAL EMERGENCY NUMBERS — hardcoded, never requires network ────────────

export const NATIONAL_EMERGENCY_NUMBERS = {
  ambulance: '102',
  emergency: '108',
  police: '100',
  fire: '101',
} as const;

// ── WHATSAPP_CASE_CATEGORIES — 8 chip options for QuickCaseModal ─────────────

export const WHATSAPP_CASE_CATEGORIES = [
  'Medical emergency',
  'Provider unreachable',
  'Language barrier',
  'Overcharge complaint',
  'Safety concern',
  'Lost / stranded',
  'Insurance issue',
  'Other',
] as const;
export type WhatsappCaseCategory = typeof WHATSAPP_CASE_CATEGORIES[number];

// ── TRAVEL HEALTH BRIDGE HELPLINE ────────────────────────────────────────────
// Plain text — shown without any link. MUST NOT require connectivity.

export const HELPLINE_WHATSAPP_NUMBER = '+91-XXXXXXXXXX'; // replace with actual number
export const HELPLINE_OPERATING_HOURS = '8am–11pm IST';

/**
 * Travel Health Bridge — Provider Ranking Algorithm
 * Implements the full 17-factor scoring per Section 03, Prompt 1.
 * AMENDED: Emergency capability split per Amendment 3.
 *
 * This is the single source of truth for how providers are ranked.
 * Any change to scoring must update this file and the unit tests.
 */

import { Provider, UrgencyLevel, RankProvidersResult } from '../types';
import { haversineDistance } from './distance';
import { isOpenNow } from './openStatus';

interface RankInput {
  providers: Provider[];
  userLanguages: string[];             // Languages user selected in triage
  urgency: UrgencyLevel;              // 'emergency'|'urgent'|'can_wait'
  budget: number;                     // max fee user selected
  lat?: number;                       // user GPS latitude (optional)
  lng?: number;                       // user GPS longitude (optional)
  symptom?: string;                   // symptom key for specialty matching
  symptomToSpecialty?: Record<string, string[]>; // map symptom → specialties
  availabilityStatuses?: Record<string, 'available' | 'busy'>;
  currentTime?: Date;                 // injectable for testing
}

interface ScoredProvider {
  provider: Provider;
  score: number;
  breakdown: Record<string, number>;  // for debugging / unit tests
}

// ── Scoring constants ────────────────────────────────────────

const SCORE = {
  LANGUAGE_EXACT: 3,
  LANGUAGE_PARTIAL: 1,
  OPEN_NOW: 2,
  OPENING_SOON: 1,
  FRESHNESS_FRESH: 2,
  FRESHNESS_STALE: 1,
  BUDGET_WITHIN: 2,
  BUDGET_WITHIN_20PCT: 1,
  DISTANCE_LT_2KM: 3,
  DISTANCE_LT_5KM: 2,
  DISTANCE_LT_10KM: 1,
  EMERGENCY_CAPABILITY_EMERGENCY: 5, // urgency='emergency' per Amendment 3
  EMERGENCY_CAPABILITY_URGENT: 2,    // urgency='urgent' per Amendment 3
  SPECIALTY_MATCH: 1,
  RELIABILITY_MAX: 2,                // reliability score × 2 contribution
  BUSY_PENALTY: -10,                 // Significant penalty for 'busy' status
} as const;

/**
 * rankProviders — full 17-factor scoring algorithm.
 *
 * Returns top 2 providers. If < 2 score above 0, sets showHelplineCTA = true.
 * Excludes providers with staleness_tier = 'lapsed'.
 * Excludes providers with badge_status = 'suspended'.
 */
export function rankProviders({
  providers = [],
  userLanguages = [],
  urgency = 'can_wait',
  budget = 1000,
  lat,
  lng,
  symptom,
  symptomToSpecialty = {},
  availabilityStatuses = {},
  currentTime,
}: RankInput): RankProvidersResult {
  const normalizedUserLangs = (userLanguages || []).map((l) => l.toLowerCase());
  const hasLanguagePreference = normalizedUserLangs.length > 0;

  // ── Step 1: Hard exclusions ───────────────────────────────
  let candidates = providers.filter((p) => {
    if (p.staleness_tier === 'lapsed') return false;
    if (p.staleness_tier === 'very_stale') return false;
    if (p.badge_status !== 'active') return false;
    return true;
  });

  // ── Step 2: Language filter (soft exclusion) ──────────────
  // If user has a language preference, filter out providers with NO match.
  // Partial match (any shared language) is kept.
  if (hasLanguagePreference) {
    const withLanguageMatch = candidates.filter((p) => {
      const providerLangs = p.languages.map((l) => l.toLowerCase());
      return normalizedUserLangs.some((ul) => providerLangs.includes(ul));
    });
    // Only apply filter if there are still candidates — otherwise fall back
    if (withLanguageMatch.length > 0) {
      candidates = withLanguageMatch;
    }
  }

  // ── Step 3: Score each candidate ─────────────────────────
  const scored: ScoredProvider[] = candidates.map((provider) => {
    let score = 0;
    const breakdown: Record<string, number> = {};

    // --- Language score (exact vs partial) ---
    const providerLangs = provider.languages.map((l) => l.toLowerCase());
    const isExactMatch = normalizedUserLangs.every((ul) =>
      providerLangs.includes(ul)
    );
    const isPartialMatch =
      !isExactMatch &&
      normalizedUserLangs.some((ul) => providerLangs.includes(ul));

    const langScore = isExactMatch
      ? SCORE.LANGUAGE_EXACT
      : isPartialMatch
      ? SCORE.LANGUAGE_PARTIAL
      : 0;
    score += langScore;
    breakdown.language = langScore;

    // --- Open status ---
    const openStatus = isOpenNow(provider.opd_hours, currentTime);
    const openScore =
      openStatus === 'open'
        ? SCORE.OPEN_NOW
        : openStatus === 'opening_soon'
        ? SCORE.OPENING_SOON
        : 0;
    score += openScore;
    breakdown.open_status = openScore;

    // --- Freshness ---
    const freshnessScore =
      provider.staleness_tier === 'fresh'
        ? SCORE.FRESHNESS_FRESH
        : provider.staleness_tier === 'stale'
        ? SCORE.FRESHNESS_STALE
        : 0; // very_stale already excluded above
    score += freshnessScore;
    breakdown.freshness = freshnessScore;

    // --- Budget ---
    const feeMin = provider.fee_opd.min;
    const feeMax = provider.fee_opd.max;
    let budgetScore = 0;
    if (feeMin <= budget) {
      budgetScore = SCORE.BUDGET_WITHIN;
    } else if (feeMin <= budget * 1.2) {
      budgetScore = SCORE.BUDGET_WITHIN_20PCT;
    }
    score += budgetScore;
    breakdown.budget = budgetScore;

    // --- Distance (only if user GPS provided) ---
    let distanceScore = 0;
    if (lat !== undefined && lng !== undefined && provider.lat !== undefined && provider.lng !== undefined) {
      const distKm = haversineDistance(lat, lng, provider.lat, provider.lng);
      if (distKm < 2) distanceScore = SCORE.DISTANCE_LT_2KM;
      else if (distKm < 5) distanceScore = SCORE.DISTANCE_LT_5KM;
      else if (distKm < 10) distanceScore = SCORE.DISTANCE_LT_10KM;
    }
    score += distanceScore;
    breakdown.distance = distanceScore;

    // --- Emergency capability (AMENDED per Amendment 3) ---
    let emergencyScore = 0;
    if (provider.emergency) {
      if (urgency === 'emergency') {
        emergencyScore = SCORE.EMERGENCY_CAPABILITY_EMERGENCY; // +5
      } else if (urgency === 'urgent') {
        emergencyScore = SCORE.EMERGENCY_CAPABILITY_URGENT;    // +2
      }
      // can_wait → 0 (no bonus)
    }
    score += emergencyScore;
    breakdown.emergency_capability = emergencyScore;

    // --- Reliability score (only if 5+ feedback records) ---
    // Reliability score is pre-computed on Provider (0-2 pts)
    const reliabilityScore = provider.reliability_score ?? 0;
    score += reliabilityScore;
    breakdown.reliability = reliabilityScore;

    // --- Specialty match ---
    let specialtyScore = 0;
    if (symptom && symptomToSpecialty) {
      const matchingSpecialties = symptomToSpecialty[symptom] ?? [];
      const hasSpecialtyOverlap = provider.specialties.some((s) =>
        matchingSpecialties.some((ms) =>
          s.toLowerCase().includes(ms.toLowerCase())
        )
      );
      if (hasSpecialtyOverlap) {
        specialtyScore = SCORE.SPECIALTY_MATCH;
      }
    }
    score += specialtyScore;
    breakdown.specialty = specialtyScore;

    // --- Availability --- (AMENDED per Provider PWA spec)
    const status = availabilityStatuses?.[provider.id] || 'available';
    if (status === 'busy') {
      score += SCORE.BUSY_PENALTY;
      breakdown.availability = SCORE.BUSY_PENALTY;
    }

    return { provider, score, breakdown };
  });

  // ── Step 4: Filter out zero-scorers, sort, tiebreak ──────
  const aboveZero = scored.filter((s) => s.score > 0);

  // Tiebreaker: more recent badge_date wins
  aboveZero.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tiebreak: newer badge_date wins
    const dateA = new Date(a.provider.badge_date).getTime();
    const dateB = new Date(b.provider.badge_date).getTime();
    return dateB - dateA;
  });

  const top2 = aboveZero.slice(0, 2);

  return {
    primary: top2[0]?.provider ?? null,
    secondary: top2[1]?.provider ?? null,
    showHelplineCTA: top2.length < 2,
  };
}

// Export breakdown type for testing
export type { ScoredProvider };

/**
 * Travel Health Bridge — Provider Reliability Score
 * AMENDED per Amendment 4 — Broader Reliability Score
 *
 * Computes a 0-1 reliability score from 4 components.
 * Returns 0 if fewer than 5 feedback records (minimum threshold per spec).
 * The score is multiplied by 2 to yield a 0-2 point contribution to ranking.
 */

interface FeedbackRecord {
  cost_accurate: 'yes' | 'no' | 'not_sure' | null;
  language_comfort: 'yes' | 'partial' | 'no' | null;
  star_rating: number | null; // 1-5
}

interface NoAnswerEvent {
  occurred_at: string; // ISO date — used to filter last 90 days
}

interface ReliabilityInput {
  feedbackRecords: FeedbackRecord[];
  totalReferrals: number;           // total referrals in last 90 days
  noAnswerEvents: NoAnswerEvent[];  // no-answer events in last 90 days
}

interface ReliabilityScore {
  raw: number;       // 0-1 combined score
  points: number;    // 0-2 (raw × 2, applied to ranking)
  components: {
    cost_accuracy: number;       // 0-1
    no_answer_inverted: number;  // 0-1
    avg_star_normalized: number; // 0-1
    language_comfort: number;    // 0-1
  };
  record_count: number;
  is_active: boolean; // false if < 5 records
}

const MIN_FEEDBACK_RECORDS = 5; // per spec Amendment 4

/**
 * Weights per spec Amendment 4:
 *  Cost accuracy:       40%
 *  No-answer (inverted): 30%
 *  Average star rating:  20%
 *  Language comfort:     10%
 */
const WEIGHTS = {
  cost_accuracy: 0.4,
  no_answer_inverted: 0.3,
  avg_star_normalized: 0.2,
  language_comfort: 0.1,
} as const;

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export function computeReliabilityScore({
  feedbackRecords,
  totalReferrals,
  noAnswerEvents,
}: ReliabilityInput): ReliabilityScore {
  const recordCount = feedbackRecords.length;

  // Per spec: below 5 records → reliability score = 0 (no bonus, no penalty)
  if (recordCount < MIN_FEEDBACK_RECORDS) {
    return {
      raw: 0,
      points: 0,
      components: {
        cost_accuracy: 0,
        no_answer_inverted: 0,
        avg_star_normalized: 0,
        language_comfort: 0,
      },
      record_count: recordCount,
      is_active: false,
    };
  }

  // ── Component 1: Cost accuracy rate (40%) ─────────────────
  // confirmed_cost_accurate / total_feedback_with_cost_response
  const withCostResponse = feedbackRecords.filter(
    (f) => f.cost_accurate !== null
  );
  const costAccurateCount = withCostResponse.filter(
    (f) => f.cost_accurate === 'yes'
  ).length;
  const costAccuracy =
    withCostResponse.length > 0
      ? costAccurateCount / withCostResponse.length
      : 0;

  // ── Component 2: No-answer rate (inverted) (30%) ──────────
  // 1 - (no_answer_events_last_90d / total_referrals_last_90d)
  const cutoff = Date.now() - NINETY_DAYS_MS;
  const recentNoAnswers = noAnswerEvents.filter(
    (e) => new Date(e.occurred_at).getTime() >= cutoff
  ).length;
  const noAnswerRate =
    totalReferrals > 0 ? recentNoAnswers / totalReferrals : 0;
  const noAnswerInverted = Math.max(0, 1 - noAnswerRate);

  // ── Component 3: Average star rating (20%) ────────────────
  // avg(star_rating) / 5 — normalised to 0-1
  const withStarRating = feedbackRecords.filter(
    (f) => f.star_rating !== null
  );
  const avgStar =
    withStarRating.length > 0
      ? withStarRating.reduce((sum, f) => sum + (f.star_rating ?? 0), 0) /
        withStarRating.length
      : 0;
  const avgStarNormalized = avgStar / 5;

  // ── Component 4: Language comfort rate (10%) ──────────────
  // language_comfortable_yes / total_feedback_with_language_response
  const withLanguageResponse = feedbackRecords.filter(
    (f) => f.language_comfort !== null
  );
  const languageYesCount = withLanguageResponse.filter(
    (f) => f.language_comfort === 'yes'
  ).length;
  const languageComfort =
    withLanguageResponse.length > 0
      ? languageYesCount / withLanguageResponse.length
      : 0;

  // ── Combined score ────────────────────────────────────────
  const raw =
    WEIGHTS.cost_accuracy * costAccuracy +
    WEIGHTS.no_answer_inverted * noAnswerInverted +
    WEIGHTS.avg_star_normalized * avgStarNormalized +
    WEIGHTS.language_comfort * languageComfort;

  // Clamp to [0, 1]
  const rawClamped = Math.max(0, Math.min(1, raw));
  const points = rawClamped * 2; // 0-2 pts contribution to ranking

  return {
    raw: rawClamped,
    points,
    components: {
      cost_accuracy: costAccuracy,
      no_answer_inverted: noAnswerInverted,
      avg_star_normalized: avgStarNormalized,
      language_comfort: languageComfort,
    },
    record_count: recordCount,
    is_active: true,
  };
}

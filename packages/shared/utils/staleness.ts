/**
 * Computes the staleness tier for a provider based on their last_activity_at.
 * Used for ranking exclusions and UI labels.
 *
 * Thresholds per spec:
 *  fresh:      < 14 days since last_activity_at
 *  stale:      14–29 days
 *  very_stale: 30–59 days
 *  lapsed:     60+ days → excluded from ranking entirely
 */
export type StalenessTier = 'fresh' | 'stale' | 'very_stale' | 'lapsed';

export function computeStalenessTier(
  last_activity_at: string | null | undefined
): StalenessTier {
  if (!last_activity_at) return 'lapsed';

  const last = new Date(last_activity_at).getTime();
  if (isNaN(last)) return 'lapsed';

  const now = Date.now();
  const diffDays = (now - last) / (1000 * 60 * 60 * 24);

  if (diffDays < 14) return 'fresh';
  if (diffDays < 30) return 'stale';
  if (diffDays < 60) return 'very_stale';
  return 'lapsed';
}

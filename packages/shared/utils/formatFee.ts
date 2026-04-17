/**
 * Formats a fee range into the standard display string.
 * Per spec: formatFeeRange(400, 600) → '₹400–600'
 */
export function formatFeeRange(min: number, max: number): string {
  if (min === max) return `₹${min}`;
  return `₹${min}–${max}`;
}

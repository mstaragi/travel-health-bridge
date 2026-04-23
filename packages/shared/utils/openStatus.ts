/**
 * Determines if a provider is open now, opening soon, or closed.
 *
 * opd_hours_json shape (per Provider interface):
 * {
 *   monday: { open: true, from: "09:00", to: "21:00" },
 *   tuesday: { open: false },
 *   ...
 * }
 */

type DayHours = {
  open: boolean;
  from?: string; // "HH:MM" in 24h format
  to?: string;   // "HH:MM" in 24h format
};

type OpdHoursJson = {
  [day: string]: DayHours;
};

export type OpenStatus = 'open' | 'opening_soon' | 'closed' | 'unconfirmed';

const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

function parseMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Returns the open status of a provider at a given time.
 * @param opd_hours_json - OPD hours object (day → {open, from, to})
 * @param current_time - Date object to check against (defaults to now)
 */
export function isOpenNow(
  opd_hours_json: OpdHoursJson | null | undefined,
  current_time?: Date
): OpenStatus {
  if (!opd_hours_json) return 'unconfirmed';

  const now = current_time ?? new Date();
  const dayName = DAYS[now.getDay()];
  const todayHours = opd_hours_json[dayName];

  if (!todayHours || !todayHours.open) {
    // Check next 2 hours: if tomorrow opens within 2h of now
    const tomorrowName = DAYS[(now.getDay() + 1) % 7];
    const tomorrowHours = opd_hours_json[tomorrowName];
    if (tomorrowHours?.open && tomorrowHours.from) {
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      // Only relevant if current time is near midnight (e.g. 22:00+)
      const minutesToMidnight = 24 * 60 - nowMinutes;
      const tomorrowOpenMinutes = parseMinutes(tomorrowHours.from);
      if (minutesToMidnight + tomorrowOpenMinutes <= 120) {
        return 'opening_soon';
      }
    }
    return 'closed';
  }

  if (!todayHours.from || !todayHours.to) return 'unconfirmed';

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const fromMinutes = parseMinutes(todayHours.from);
  const toMinutes = parseMinutes(todayHours.to);

  if (nowMinutes >= fromMinutes && nowMinutes < toMinutes) {
    return 'open';
  }

  // Opening in the next 2 hours (120 minutes)
  if (nowMinutes < fromMinutes && fromMinutes - nowMinutes <= 120) {
    return 'opening_soon';
  }

  return 'closed';
}

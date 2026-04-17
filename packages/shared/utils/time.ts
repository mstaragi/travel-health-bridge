/**
 * Travel Health Bridge — Time Utilities
 * High-reliability time logic for IST (UTC+5:30)
 */

/**
 * Returns true if the current time is within IST quiet hours (10pm - 7am)
 * logic is based on UTC to ensure reliability regardless of device/server local time.
 */
export function isQuietHoursIST(): boolean {
  const now = new Date();
  
  // Calculate IST hours (UTC + 5.5)
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  
  let istHours = (utcHours + 5) % 24;
  let istMinutes = utcMinutes + 30;
  
  if (istMinutes >= 60) {
    istHours = (istHours + 1) % 24;
  }
  
  // Quiet hours: 10pm (22:00) to 7am (07:00)
  return istHours >= 22 || istHours < 7;
}

/**
 * Formats a Date object to IST ISO-like string
 */
export function toISTString(date: Date = new Date()): string {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  return istDate.toISOString().replace('Z', '+05:30');
}

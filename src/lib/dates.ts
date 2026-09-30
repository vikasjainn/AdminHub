/**
 * All generated data is anchored to this fixed "today" (the date shown in the
 * design) so that every record is reproducible and the UI never depends on the
 * real clock.
 */
export const REFERENCE_DATE = '2024-10-01T12:00:00Z';

const DAY_MS = 86_400_000;

export const referenceTime = (): number => Date.parse(REFERENCE_DATE);

/** ISO timestamp for the reference date shifted by `offsetDays`, at hour:minute UTC. */
export function isoFromReference(offsetDays: number, hour = 0, minute = 0): string {
  const base = new Date(REFERENCE_DATE);
  return new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + offsetDays, hour, minute),
  ).toISOString();
}

export const isoDate = (iso: string): string => iso.slice(0, 10);

export function shiftIsoDate(isoDay: string, offsetDays: number): string {
  return new Date(Date.parse(isoDay) + offsetDays * DAY_MS).toISOString().slice(0, 10);
}

export const daysAgoTime = (days: number): number => referenceTime() - days * DAY_MS;

const utc = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' });

const shortDate = utc({ month: 'short', day: '2-digit', year: 'numeric' });
const shortMonthDay = utc({ month: 'short', day: '2-digit' });
const longDate = utc({ month: 'long', day: 'numeric', year: 'numeric' });
const fullDate = utc({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const time24 = utc({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const time12 = utc({ hour: 'numeric', minute: '2-digit', hour12: true });
const monthShort = utc({ month: 'short' });
const monthYear = utc({ month: 'short', year: 'numeric' });

export const formatDate = (iso: string): string => shortDate.format(new Date(iso));
export const formatLongDate = (iso: string): string => longDate.format(new Date(iso));
export const formatFullDate = (iso: string): string => fullDate.format(new Date(iso));
export const formatTime = (iso: string): string => time24.format(new Date(iso));
export const formatTime12 = (iso: string): string => time12.format(new Date(iso));
export const formatDateTime = (iso: string): string => `${formatDate(iso)} ${formatTime(iso)}`;
export const formatLogTime = (iso: string): string => `${formatDate(iso)}, ${formatTime(iso)}`;
export const formatShortLogTime = (iso: string): string => `${shortMonthDay.format(new Date(iso))}, ${formatTime(iso)}`;
export const formatMonthShort = (iso: string): string => monthShort.format(new Date(iso));
export const formatMonthYear = (iso: string): string => monthYear.format(new Date(iso));

export function formatDuration(hours: number): string {
  return `${hours.toFixed(1)} ${hours === 1 ? 'hr' : 'hrs'}`;
}

/** Adds `hours` to an HH:mm string (wraps at 24h). */
export function addHoursToTime(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = (h * 60 + m + hours * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** DummyJSON birth dates look like "1996-5-30" (unpadded). */
export function normalizeBirthDate(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return '1990-01-01';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

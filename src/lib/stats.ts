import type { Booking, DashboardData, RevenuePoint, Transaction, Trend, User } from '@/types';
import { daysAgoTime, formatMonthShort, formatMonthYear, REFERENCE_DATE } from '@/lib/dates';

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

/** Revenue = settled money in: completed payments and transfers (refunds excluded). */
export const revenueOf = (transactions: Transaction[]): number =>
  sum(transactions.filter((t) => t.status === 'Completed' && t.type !== 'Refund').map((t) => t.amount));

export const isActiveBooking = (booking: Booking): boolean =>
  booking.status === 'Confirmed' || booking.status === 'Pending';

const countBy = <T,>(items: T[], predicate: (item: T) => boolean): number => items.filter(predicate).length;

function toTrend(current: number, previous: number): Trend {
  if (previous === 0) return { value: '0.0', direction: 'neutral' };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(change).toFixed(1), direction: change < 0 ? 'down' : 'up' };
}

/** Compares a measure over the last 30 days against the 30 days before that. */
export function periodChange<T>(items: T[], dateOf: (item: T) => string, measure: (items: T[]) => number): Trend {
  const now = daysAgoTime(0);
  const monthAgo = daysAgoTime(30);
  const twoMonthsAgo = daysAgoTime(60);
  const within = (item: T, from: number, to: number) => {
    const time = Date.parse(dateOf(item));
    return time > from && time <= to;
  };
  return toTrend(
    measure(items.filter((item) => within(item, monthAgo, now))),
    measure(items.filter((item) => within(item, twoMonthsAgo, monthAgo))),
  );
}

/** Growth of a running total: how many matching items exist now vs. 30 days ago. */
export function cumulativeChange<T>(items: T[], dateOf: (item: T) => string, matches: (item: T) => boolean = () => true): Trend {
  const existedBy = (time: number) => countBy(items, (item) => matches(item) && Date.parse(dateOf(item)) <= time);
  return toTrend(existedBy(daysAgoTime(0)), existedBy(daysAgoTime(30)));
}

const isActiveUser = (user: User): boolean => user.status === 'Active';

export function getUserStats(users: User[]) {
  const joined = (list: User[]) => list.length;
  return {
    total: users.length,
    active: countBy(users, isActiveUser),
    newThisMonth: countBy(users, (u) => Date.parse(u.joined) > daysAgoTime(30)),
    trends: {
      total: cumulativeChange(users, (u) => u.joined),
      active: cumulativeChange(users, (u) => u.joined, isActiveUser),
      newUsers: periodChange(users, (u) => u.joined, joined),
    },
  };
}

export function getTransactionStats(transactions: Transaction[]) {
  const volumeOf = (list: Transaction[]) =>
    sum(list.filter((t) => t.status === 'Completed').map((t) => Math.abs(t.amount)));
  const averageOf = (list: Transaction[]) => (list.length ? sum(list.map((t) => Math.abs(t.amount))) / list.length : 0);
  const successRateOf = (list: Transaction[]) =>
    list.length ? (countBy(list, (t) => t.status === 'Completed') / list.length) * 100 : 0;
  const date = (t: Transaction) => t.timestamp;

  return {
    total: transactions.length,
    volume: volumeOf(transactions),
    average: averageOf(transactions),
    successRate: successRateOf(transactions),
    trends: {
      total: cumulativeChange(transactions, date),
      volume: periodChange(transactions, date, volumeOf),
      average: periodChange(transactions, date, averageOf),
      successRate: periodChange(transactions, date, successRateOf),
    },
  };
}

export function getBookingStats(bookings: Booking[]) {
  const date = (b: Booking) => b.createdAt;
  const completed = (l: Booking[]) => countBy(l, (b) => b.status === 'Completed');
  const cancelled = (l: Booking[]) => countBy(l, (b) => b.status === 'Cancelled');

  return {
    total: bookings.length,
    active: countBy(bookings, isActiveBooking),
    completed: completed(bookings),
    cancelled: cancelled(bookings),
    trends: {
      total: cumulativeChange(bookings, date),
      active: cumulativeChange(bookings, date, isActiveBooking),
      completed: periodChange(bookings, date, completed),
      cancelled: periodChange(bookings, date, cancelled),
    },
  };
}

/** Monthly revenue (in $K) for the six full months before the reference month. */
export function buildRevenueSeries(transactions: Transaction[]): { points: RevenuePoint[]; range: string } {
  const reference = new Date(REFERENCE_DATE);
  const months = Array.from({ length: 6 }, (_, i) => {
    const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - (6 - i), 1));
    return { key: start.toISOString().slice(0, 7), iso: start.toISOString() };
  });

  const points = months.map(({ key, iso }) => ({
    month: formatMonthShort(iso),
    value: Math.round(revenueOf(transactions.filter((t) => t.timestamp.startsWith(key))) / 100) / 10,
  }));

  return { points, range: `${formatMonthYear(months[0].iso)} – ${formatMonthYear(months[5].iso)}` };
}

export function buildDashboardData(users: User[], transactions: Transaction[], bookings: Booking[]): DashboardData {
  const { points, range } = buildRevenueSeries(transactions);
  const pending = (l: Transaction[]) => countBy(l, (t) => t.status === 'Pending');

  return {
    totalUsers: users.length,
    revenue: revenueOf(transactions),
    activeBookings: countBy(bookings, isActiveBooking),
    pendingTransactions: pending(transactions),
    trends: {
      users: cumulativeChange(users, (u) => u.joined),
      revenue: periodChange(transactions, (t) => t.timestamp, revenueOf),
      bookings: cumulativeChange(bookings, (b) => b.createdAt, isActiveBooking),
      pending: periodChange(transactions, (t) => t.timestamp, pending),
    },
    revenueSeries: points,
    revenueRange: range,
    recentTransactions: transactions.slice(0, 6),
    totalTransactions: transactions.length,
  };
}

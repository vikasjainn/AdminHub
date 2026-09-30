import type {
  Booking,
  BookingsFilters,
  DateRange,
  Transaction,
  TransactionsFilters,
  User,
  UsersFilters,
} from '@/types';
import { PAGE_SIZE } from '@/lib/constants';
import { daysAgoTime } from '@/lib/dates';

const RANGE_DAYS: Record<Exclude<DateRange, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

const includesText = (haystack: string, needle: string): boolean =>
  haystack.toLowerCase().includes(needle.trim().toLowerCase());

/** Lower bound only, so upcoming bookings stay visible in "Last N days". */
const isWithinRange = (iso: string, range: DateRange): boolean =>
  range === 'all' || Date.parse(iso) >= daysAgoTime(RANGE_DAYS[range]);

export const filterUsers = (users: User[], f: UsersFilters): User[] =>
  users.filter(
    (u) =>
      includesText(`${u.firstName} ${u.lastName} ${u.email}`, f.search) &&
      (f.role === 'All' || u.role === f.role) &&
      (f.status === 'All' || u.status === f.status),
  );

export const filterTransactions = (transactions: Transaction[], f: TransactionsFilters): Transaction[] =>
  transactions.filter(
    (t) =>
      includesText(`${t.code} ${t.customer}`, f.search) &&
      (f.type === 'All' || t.type === f.type) &&
      isWithinRange(t.timestamp, f.dateRange),
  );

export const filterBookings = (bookings: Booking[], f: BookingsFilters): Booking[] =>
  bookings.filter(
    (b) =>
      includesText(`${b.code} ${b.customer}`, f.search) &&
      (f.status === 'All' || b.status === f.status) &&
      (f.service === 'All' || b.service === f.service) &&
      isWithinRange(b.date, f.dateRange),
  );

export interface Page<T> {
  rows: T[];
  page: number;
  pages: number;
  total: number;
  from: number;
  to: number;
}

/** Client-side pagination; the requested page is clamped into range. */
export function paginate<T>(items: T[], requestedPage: number, pageSize = PAGE_SIZE): Page<T> {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pages);
  const start = (page - 1) * pageSize;
  return {
    rows: items.slice(start, start + pageSize),
    page,
    pages,
    total: items.length,
    from: items.length ? start + 1 : 0,
    to: Math.min(page * pageSize, items.length),
  };
}

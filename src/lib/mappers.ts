import type {
  Booking,
  BookingStatus,
  DummyProduct,
  DummyUser,
  Role,
  ServiceType,
  Transaction,
  TransactionStatus,
  TransactionType,
  User,
  UserStatus,
} from '@/types';
import { SERVICE_TYPES } from '@/lib/constants';
import { isoDate, isoFromReference, normalizeBirthDate } from '@/lib/dates';
import { pick, round2, seededInt } from '@/lib/seed';

/*
 * DummyJSON provides users and products only. Everything AdminHub needs on top
 * (status, transaction type, booking service, dates, ...) is derived from the
 * API record index/id with a seeded hash, so output is stable across renders.
 */

const TRANSACTION_COUNT = 240;
const BOOKING_COUNT = 180;

const ROLE_BY_API_ROLE: Record<DummyUser['role'], Role> = {
  admin: 'Admin',
  moderator: 'Editor',
  user: 'Viewer',
};

// Repeated entries act as weights.
const USER_STATUS_POOL: readonly UserStatus[] = [
  'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Inactive', 'Inactive', 'Suspended',
];
const LAST_ACTIVE_POOL = [
  '2 mins ago', '1 hour ago', '3 days ago', 'Just now', '1 week ago', '5 mins ago', '10 mins ago', '4 days ago',
] as const;
const TWO_FA_POOL = ['Enabled', 'Enabled', 'Disabled'] as const;

const TRANSACTION_TYPE_POOL: readonly TransactionType[] = [
  'Payment', 'Payment', 'Payment', 'Payment', 'Payment', 'Payment', 'Transfer', 'Transfer', 'Refund', 'Refund',
];
const PAYMENT_STATUS_POOL: readonly TransactionStatus[] = [
  'Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Pending', 'Pending', 'Failed',
];
const REFUND_STATUS_POOL: readonly TransactionStatus[] = ['Refunded', 'Refunded', 'Refunded', 'Completed', 'Pending'];

const FUTURE_BOOKING_STATUS_POOL: readonly BookingStatus[] = ['Confirmed', 'Confirmed', 'Confirmed', 'Pending', 'Pending', 'Cancelled'];
const PAST_BOOKING_STATUS_POOL: readonly BookingStatus[] = ['Completed', 'Completed', 'Completed', 'Completed', 'Cancelled'];
const BOOKING_HOURS = [9, 10, 11, 13, 14, 15, 16] as const;
const BOOKING_DURATIONS = [1, 1.5, 2] as const;

export function mapUser(user: DummyUser): User {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    image: user.image,
    role: ROLE_BY_API_ROLE[user.role] ?? 'Viewer',
    status: pick(USER_STATUS_POOL, user.id, 1),
    joined: isoDate(isoFromReference(-(3 + (seededInt(user.id, 2) % 600)))),
    lastActive: pick(LAST_ACTIVE_POOL, user.id, 3),
    dob: normalizeBirthDate(user.birthDate),
    address: [user.address.address, user.address.city, user.address.state].filter(Boolean).join(', '),
    twoFA: pick(TWO_FA_POOL, user.id, 4),
  };
}

const fullName = (user: User): string => `${user.firstName} ${user.lastName}`;

/** Assigns display ids from the sorted position so ids run newest (highest) to oldest. */
const withIds = <T extends { id: number; code: string }>(
  drafts: Omit<T, 'id' | 'code'>[],
  base: number,
  prefix: string,
): T[] =>
  drafts.map((draft, index) => {
    const id = base + drafts.length - index;
    return { ...draft, id, code: `${prefix}-${id}` } as T;
  });

/** Newest first. The oldest record lands on the first day of the six-month chart window. */
export function buildTransactions(users: User[], products: DummyProduct[]): Transaction[] {
  if (!users.length || !products.length) return [];

  const drafts = Array.from({ length: TRANSACTION_COUNT }, (_, n): Omit<Transaction, 'id' | 'code'> => {
    const user = users[(n * 7 + 3) % users.length];
    const product = products[(n * 11 + 5) % products.length];
    const type = pick(TRANSACTION_TYPE_POOL, n, 5);
    const gross = round2(product.price * (1 + (seededInt(n, 6) % 12)));
    const dayOffset = -(1 + Math.floor((n * 183) / TRANSACTION_COUNT));

    return {
      userId: user.id,
      customer: fullName(user),
      email: user.email,
      productTitle: product.title,
      type,
      amount: type === 'Refund' ? -gross : gross,
      status: type === 'Refund' ? pick(REFUND_STATUS_POOL, n, 7) : pick(PAYMENT_STATUS_POOL, n, 7),
      timestamp: isoFromReference(dayOffset, 8 + (seededInt(n, 8) % 10), pick([0, 12, 32, 45], n, 9)),
    };
  });

  drafts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return withIds<Transaction>(drafts, 1000, '#TXN');
}

/** Newest (upcoming) first. Spans 60 days back to 14 days ahead of the reference date. */
export function buildBookings(users: User[], products: DummyProduct[]): Booking[] {
  if (!users.length || !products.length) return [];

  const drafts = Array.from({ length: BOOKING_COUNT }, (_, n): Omit<Booking, 'id' | 'code'> => {
    const user = users[(n * 5 + 1) % users.length];
    const product = products[(n * 3 + 2) % products.length];
    const dayOffset = 14 - Math.floor((n * 74) / BOOKING_COUNT);
    const durationHours = pick(BOOKING_DURATIONS, n, 12);
    const isUpcoming = dayOffset >= 0;
    const service: ServiceType = pick(SERVICE_TYPES, n, 10);

    return {
      userId: user.id,
      customer: fullName(user),
      email: user.email,
      productTitle: product.title,
      productCategory: product.category,
      service,
      date: isoDate(isoFromReference(dayOffset)),
      time: `${String(pick(BOOKING_HOURS, n, 11)).padStart(2, '0')}:${pick(['00', '30'], n, 13)}`,
      durationHours,
      status: pick(isUpcoming ? FUTURE_BOOKING_STATUS_POOL : PAST_BOOKING_STATUS_POOL, n, 14),
      amount: Math.round((50 + product.price) * durationHours),
      // Always created before both its date and the reference date.
      createdAt: isoFromReference(
        (isUpcoming ? 0 : dayOffset) - (2 + (seededInt(n, 15) % (isUpcoming ? 45 : 10))),
        9,
        28,
      ),
    };
  });

  drafts.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  return withIds<Booking>(drafts, 2000, '#BKG');
}


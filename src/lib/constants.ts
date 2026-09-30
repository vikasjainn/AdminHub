import type { BookingStatus, DateRange, Role, ServiceType, TransactionType, UserStatus } from '@/types';

export const PAGE_SIZE = 8;

export const ROLES: readonly Role[] = ['Admin', 'Editor', 'Viewer'];
export const USER_STATUSES: readonly UserStatus[] = ['Active', 'Inactive', 'Suspended'];
export const TRANSACTION_TYPES: readonly TransactionType[] = ['Payment', 'Refund', 'Transfer'];
export const BOOKING_STATUSES: readonly BookingStatus[] = ['Confirmed', 'Completed', 'Pending', 'Cancelled'];
export const SERVICE_TYPES: readonly ServiceType[] = [
  'Business Consultation',
  'Technical Support',
  'Executive Coaching',
  'Strategy Session',
  'Personal Training',
];

export const DATE_RANGES: readonly { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
];

/** The signed-in administrator. DummyJSON has no notion of "current user". */
export const CURRENT_ADMIN = {
  userId: 1,
  name: 'Sarah Jenkins',
  firstName: 'Sarah',
  title: 'Super Admin',
  avatar: 'https://i.pravatar.cc/80?img=47',
} as const;

export const PROFILE_HREF = `/users/${CURRENT_ADMIN.userId}`;

/** Flat rates used when a booking is created manually from the "New Booking" dialog. */
export const SERVICE_RATES: Record<(typeof SERVICE_TYPES)[number], number> = {
  'Business Consultation': 180,
  'Technical Support': 120,
  'Executive Coaching': 250,
  'Strategy Session': 180,
  'Personal Training': 95,
};

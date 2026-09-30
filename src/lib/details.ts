import type { Booking, Transaction, User } from '@/types';
import {
  addHoursToTime,
  formatDate,
  formatLogTime,
  formatShortLogTime,
  formatTime12,
} from '@/lib/dates';
import { pick, round2 } from '@/lib/seed';

export interface TimelineEntry {
  title: string;
  description: string;
  time: string;
  tone?: 'success' | 'danger' | 'default';
}

const PAYMENT_METHODS = [
  { long: 'Credit Card (Visa ending in 4582)', short: 'Visa Card (*4582)' },
  { long: 'Credit Card (Mastercard ending in 9031)', short: 'Mastercard (*9031)' },
  { long: 'PayPal Account', short: 'Direct PayPal Link' },
] as const;
const TYPE_LABELS = { Payment: 'Service Payment', Refund: 'Account Refund', Transfer: 'Wallet Transfer' } as const;

const minutesBefore = (iso: string, minutes: number): string => new Date(Date.parse(iso) - minutes * 60_000).toISOString();

export function describeTransaction(t: Transaction) {
  const total = Math.abs(t.amount);
  const fee = round2(total * 0.029 + 0.3);
  return {
    reference: `#REF-${98_000_000 + t.id * 137}`,
    typeLabel: TYPE_LABELS[t.type],
    paymentMethod: pick(PAYMENT_METHODS, t.id, 21).long,
    gateway: pick(PAYMENT_METHODS, t.userId, 22).short,
    fee,
    subtotal: Math.max(0, round2(total - fee)),
    total,
    generatedOn: `${formatDate(t.timestamp)} ${formatTime12(t.timestamp)}`,
  };
}

export function buildTransactionTimeline(t: Transaction): TimelineEntry[] {
  const final: Record<Transaction['status'], Pick<TimelineEntry, 'title' | 'description' | 'tone'>> = {
    Completed: { title: 'Completed & Disbursed', description: 'Settled in merchant bank account', tone: 'success' },
    Pending: { title: 'Awaiting Settlement', description: 'Funds are held pending bank confirmation', tone: 'default' },
    Failed: { title: 'Payment Failed', description: 'Gateway declined the transaction', tone: 'danger' },
    Refunded: { title: 'Refund Issued', description: 'Amount returned to the original payment method', tone: 'default' },
  };
  return [
    { ...final[t.status], time: formatLogTime(t.timestamp) },
    { title: 'Processing & Authorized', description: 'Gateway authorization approved', time: formatLogTime(minutesBefore(t.timestamp, 2)) },
    { title: 'Initiated', description: `Checkout session for "${t.productTitle}"`, time: formatLogTime(minutesBefore(t.timestamp, 4)) },
  ];
}

export function describeBooking(b: Booking, customerBookings: Booking[]) {
  const paymentStatus = b.status === 'Cancelled' ? 'Refunded' : b.status === 'Pending' ? 'Pending' : 'Paid';
  return {
    tier: b.amount >= 250 ? 'Premium' : 'Standard',
    timeSlot: `${b.time} - ${addHoursToTime(b.time, b.durationHours)} (EST)`,
    notes: `Would like guidance on ${b.productCategory} offerings, starting with "${b.productTitle}".`,
    paymentStatus,
    invoice: `#INV-${10_000 + b.id}`,
    completedCount: customerBookings.filter((x) => x.status === 'Completed').length,
  };
}

export function buildBookingTimeline(b: Booking): TimelineEntry[] {
  const created = b.createdAt;
  const statusEntry: TimelineEntry = {
    title: `Status Set to ${b.status}`,
    description: b.status === 'Cancelled' ? 'Cancelled by an administrator' : 'Consultant assigned automatically',
    time: formatShortLogTime(minutesBefore(created, -30)),
    tone: b.status === 'Cancelled' ? 'danger' : 'success',
  };
  return [
    { title: 'Confirmation Sent', description: 'Calendar invite dispatched', time: formatShortLogTime(minutesBefore(created, -32)), tone: 'success' },
    statusEntry,
    { title: 'Booking Created', description: 'Client self service reservation', time: formatShortLogTime(created), tone: 'success' },
  ];
}

const TRANSACTION_VERBS: Record<Transaction['status'], string> = {
  Completed: 'Completed',
  Pending: 'Initiated',
  Failed: 'Failed',
  Refunded: 'Refunded',
};

/** Latest activity for a user, built from their own transactions and bookings. */
export function buildUserActivity(user: User, transactions: Transaction[], bookings: Booking[]): TimelineEntry[] {
  const entries = [
    ...transactions
      .filter((t) => t.userId === user.id)
      .map((t) => ({
        at: t.timestamp,
        title: `${TRANSACTION_VERBS[t.status]} transaction ${t.code}`,
        description: t.productTitle,
      })),
    ...bookings
      .filter((b) => b.userId === user.id)
      .map((b) => ({ at: b.createdAt, title: `Created booking ${b.code}`, description: `${b.service} session` })),
  ];
  return entries
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 5)
    .map(({ at, title, description }) => ({ title, description, time: formatLogTime(at) }));
}


'use client';

import { CalendarDays } from 'lucide-react';
import { useParams } from 'next/navigation';
import StatusBadge from '@/components/common/StatusBadge';
import { ErrorState, Skeleton } from '@/components/common/States';
import { BackLink, DetailHeader, InfoCard, Timeline } from '@/components/details/DetailParts';
import { formatDate } from '@/lib/dates';
import { buildBookingTimeline, describeBooking } from '@/lib/details';
import { formatMoney } from '@/lib/format';
import { useBooking, useBookings } from '@/hooks/queries';
import { useAppDispatch } from '@/store/hooks';
import { openModal } from '@/store/uiSlice';

const VALUE_CLASS = 'max-w-[65%] text-right font-medium';
const ACTION_DISABLED = 'disabled:cursor-not-allowed disabled:opacity-40';

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const booking = useBooking(Number(id));
  const all = useBookings();

  if (booking.isLoading) return <Skeleton className="mx-auto h-[600px] max-w-[1180px]" />;
  if (booking.isError) return <ErrorState onRetry={() => void booking.refetch()} />;
  const b = booking.data;
  if (!b) return <ErrorState message="Booking not found." />;

  const details = describeBooking(
    b,
    (all.data ?? []).filter((x) => x.userId === b.userId),
  );
  const editable = b.status === 'Confirmed' || b.status === 'Pending';
  const lockedReason = editable ? undefined : `A ${b.status.toLowerCase()} booking can no longer be changed`;

  return (
    <div className="mx-auto max-w-[1180px]">
      <BackLink label={`Bookings / ${b.code}`} />
      <DetailHeader
        leading={
          <div className="grid h-11 w-11 place-items-center rounded-full bg-indigo-50 text-indigo-600">
            <CalendarDays size={20} />
          </div>
        }
        title={`Booking ${b.code}`}
        badges={
          <>
            <StatusBadge status={b.status} />
            <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">{details.tier}</span>
          </>
        }
        subtitle={`Virtual Consultation Room • Scheduled for ${formatDate(b.date)} at ${b.time}`}
        actions={
          <>
            <button
              type="button"
              disabled={!editable}
              title={lockedReason}
              onClick={() => dispatch(openModal({ kind: 'rescheduleBooking', bookingId: b.id }))}
              className={`rounded-md border px-3 py-2 text-[11px] font-semibold ${ACTION_DISABLED}`}
            >
              Reschedule
            </button>
            <button
              type="button"
              disabled={!editable}
              title={lockedReason}
              onClick={() => dispatch(openModal({ kind: 'cancelBooking', bookingId: b.id }))}
              className={`rounded-md bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600 ${ACTION_DISABLED}`}
            >
              Cancel Booking
            </button>
          </>
        }
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_310px]">
        <div className="space-y-4">
          <InfoCard
            title="Booking Meeting Logistics"
            valueClassName={VALUE_CLASS}
            rows={[
              ['Service Type', b.service],
              ['Scheduled Date', formatDate(b.date)],
              ['Meeting Time Slot', details.timeSlot],
              ['Meeting Location', 'Virtual - Zoom Link Provided'],
              ['Client Special Notes', details.notes],
            ]}
          />
          <InfoCard
            title="Customer Overview"
            valueClassName={VALUE_CLASS}
            rows={[
              ['Customer', b.customer],
              ['Email', b.email],
              ['Previous Bookings', `${details.completedCount} Total Bookings Completed`],
            ]}
          />
        </div>
        <div className="space-y-4">
          <InfoCard
            title="Payment Ledger Breakdown"
            valueClassName={VALUE_CLASS}
            rows={[
              ['Billing Amount', formatMoney(b.amount)],
              ['Payment Status', details.paymentStatus],
              ['Invoice Link', details.invoice],
            ]}
          />
          <div className="card p-4">
            <h2 className="text-sm font-semibold">Booking Lifecycle Logs</h2>
            <Timeline items={buildBookingTimeline(b)} />
          </div>
        </div>
      </div>
    </div>
  );
}

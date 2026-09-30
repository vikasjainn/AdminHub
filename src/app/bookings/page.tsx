'use client';

import { Download, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import KpiCard, { KpiSkeletons } from '@/components/common/KpiCard';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import { EmptyState, ErrorState, TableSkeleton } from '@/components/common/States';
import { BOOKING_STATUSES, DATE_RANGES, SERVICE_TYPES } from '@/lib/constants';
import { downloadCsv } from '@/lib/csv';
import { formatDate, formatDuration } from '@/lib/dates';
import { filterBookings, paginate } from '@/lib/filters';
import { formatMoney, formatNumber } from '@/lib/format';
import { getBookingStats } from '@/lib/stats';
import { useBookings } from '@/hooks/queries';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateBookingsFilters } from '@/store/filtersSlice';
import { openModal } from '@/store/uiSlice';
import type { BookingStatus, DateRange, ServiceType } from '@/types';

const TABLE_HEADERS = ['Booking ID', 'Customer', 'Service', 'Date & Time', 'Duration', 'Status', 'Amount', 'Actions'];

export default function BookingsPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters.bookings);
  const { data: bookings, isLoading, isError, refetch } = useBookings();

  const stats = useMemo(() => (bookings ? getBookingStats(bookings) : undefined), [bookings]);
  const filtered = useMemo(() => filterBookings(bookings ?? [], filters), [bookings, filters]);
  const page = paginate(filtered, filters.page);

  const exportCsv = () =>
    downloadCsv(
      'bookings.csv',
      ['Booking ID', 'Customer', 'Service', 'Date', 'Time', 'Duration', 'Status', 'Amount'],
      filtered.map((b) => [b.code, b.customer, b.service, b.date, b.time, formatDuration(b.durationHours), b.status, b.amount.toFixed(2)]),
    );

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        eyebrow="Booking Management"
        title="Bookings Directory"
        subtitle="Manage all service bookings and consultation meetings"
        action={
          <button
            type="button"
            onClick={() => dispatch(openModal({ kind: 'newBooking' }))}
            className="hidden items-center gap-1 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 sm:flex"
          >
            <Plus size={14} />
            New Booking
          </button>
        }
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats ? (
          <>
            <KpiCard label="Total Bookings" value={formatNumber(stats.total)} trend={stats.trends.total} />
            <KpiCard label="Active Bookings" value={formatNumber(stats.active)} trend={stats.trends.active} />
            <KpiCard label="Completed Bookings" value={formatNumber(stats.completed)} trend={stats.trends.completed} />
            <KpiCard label="Cancelled Bookings" value={formatNumber(stats.cancelled)} trend={stats.trends.cancelled} />
          </>
        ) : (
          !isError && <KpiSkeletons count={4} />
        )}
      </div>

      <div className="mt-4 card p-3">
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-md border px-3">
            <Search size={14} className="text-slate-400" />
            <input
              aria-label="Search bookings"
              value={filters.search}
              onChange={(event) => dispatch(updateBookingsFilters({ search: event.target.value }))}
              className="w-full text-xs outline-none"
              placeholder="Search bookings by ID or client..."
            />
          </div>
          <select
            aria-label="Filter by date range"
            value={filters.dateRange}
            onChange={(event) => dispatch(updateBookingsFilters({ dateRange: event.target.value as DateRange }))}
            className="h-10 rounded-md border px-3 text-[11px]"
          >
            {DATE_RANGES.map(({ value, label }) => (
              <option key={value} value={value}>
                Date Range: {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(event) => dispatch(updateBookingsFilters({ status: event.target.value as BookingStatus | 'All' }))}
            className="h-10 rounded-md border px-3 text-[11px]"
          >
            <option value="All">Status: All</option>
            {BOOKING_STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            aria-label="Filter by service type"
            value={filters.service}
            onChange={(event) => dispatch(updateBookingsFilters({ service: event.target.value as ServiceType | 'All' }))}
            className="h-10 max-w-[180px] rounded-md border px-3 text-[11px]"
          >
            <option value="All">Service Type: All</option>
            {SERVICE_TYPES.map((service) => (
              <option key={service}>{service}</option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Export bookings as CSV"
            disabled={!filtered.length}
            onClick={exportCsv}
            className="flex h-10 items-center justify-center rounded-md border px-3 text-[11px] disabled:opacity-40"
          >
            <Download size={13} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rowClassName="h-11" />
      ) : isError ? (
        <ErrorState message="The bookings data could not be loaded." onRetry={() => void refetch()} />
      ) : !page.rows.length ? (
        <EmptyState />
      ) : (
        <div className="mt-4 card overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[9px] uppercase text-slate-500">
                <tr>
                  {TABLE_HEADERS.map((header) => (
                    <th key={header} className="px-4 py-3 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.rows.map((b) => (
                  <tr key={b.id} className="table-row hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <Link href={`/bookings/${b.id}`} className="text-[10px] font-semibold hover:text-indigo-600">
                        {b.code}
                      </Link>
                    </td>
                    <td className="px-4 text-[10px]">{b.customer}</td>
                    <td className="px-4 text-[10px]">{b.service}</td>
                    <td className="px-4 text-[10px] whitespace-nowrap">
                      {formatDate(b.date)} {b.time}
                    </td>
                    <td className="px-4 text-[10px]">{formatDuration(b.durationHours)}</td>
                    <td className="px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 text-[10px] font-semibold">{formatMoney(b.amount)}</td>
                    <td className="px-4">
                      <Link href={`/bookings/${b.id}`} aria-label={`View ${b.code}`}>
                        •••
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y md:hidden">
            {page.rows.map((b) => (
              <Link href={`/bookings/${b.id}`} key={b.id} className="block p-4">
                <div className="flex justify-between">
                  <b className="text-xs">{b.code}</b>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-2 flex justify-between">
                  <div>
                    <b className="text-sm">{b.customer}</b>
                    <p className="text-[10px] text-slate-400">{b.service}</p>
                  </div>
                  <b className="text-indigo-600">{formatMoney(b.amount)}</b>
                </div>
                <p className="mt-1 text-[9px] text-slate-400">
                  {formatDate(b.date)} {b.time}
                </p>
              </Link>
            ))}
          </div>
          <Pagination page={page} onChange={(next) => dispatch(updateBookingsFilters({ page: next }))} />
        </div>
      )}
    </div>
  );
}

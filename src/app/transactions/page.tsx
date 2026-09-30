'use client';

import { Download, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import KpiCard, { KpiSkeletons } from '@/components/common/KpiCard';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import { EmptyState, ErrorState, TableSkeleton } from '@/components/common/States';
import { DATE_RANGES, TRANSACTION_TYPES } from '@/lib/constants';
import { downloadCsv } from '@/lib/csv';
import { formatDateTime } from '@/lib/dates';
import { filterTransactions, paginate } from '@/lib/filters';
import { formatMoney, formatNumber, formatPercent, formatSignedMoney, formatWholeMoney } from '@/lib/format';
import { getTransactionStats } from '@/lib/stats';
import { useTransactions } from '@/hooks/queries';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateTransactionsFilters } from '@/store/filtersSlice';
import type { DateRange, TransactionType } from '@/types';

const TABLE_HEADERS = ['Transaction ID', 'User', 'Type', 'Amount', 'Status', 'Date & Time', 'Actions'];

export default function TransactionsPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters.transactions);
  const { data: transactions, isLoading, isError, refetch } = useTransactions();

  const stats = useMemo(() => (transactions ? getTransactionStats(transactions) : undefined), [transactions]);
  const filtered = useMemo(() => filterTransactions(transactions ?? [], filters), [transactions, filters]);
  const page = paginate(filtered, filters.page);

  const exportCsv = () =>
    downloadCsv(
      'transactions.csv',
      ['Transaction ID', 'User', 'Type', 'Amount', 'Status', 'Date & Time'],
      filtered.map((t) => [t.code, t.customer, t.type, t.amount.toFixed(2), t.status, formatDateTime(t.timestamp)]),
    );

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        eyebrow="Transactions Ledger"
        title="Transaction History"
        subtitle="Monitor and manage all corporate financial transactions"
        action={
          <button
            type="button"
            disabled={!filtered.length}
            onClick={exportCsv}
            className="hidden items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium disabled:opacity-40 sm:flex"
          >
            <Download size={13} />
            Export CSV
          </button>
        }
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats ? (
          <>
            <KpiCard label="Total Transactions" value={formatNumber(stats.total)} trend={stats.trends.total} />
            <KpiCard label="Total Volume" value={formatWholeMoney(stats.volume)} trend={stats.trends.volume} />
            <KpiCard label="Avg. Transaction" value={formatMoney(stats.average)} trend={stats.trends.average} />
            <KpiCard label="Success Rate" value={formatPercent(stats.successRate)} trend={stats.trends.successRate} />
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
              aria-label="Search transactions"
              value={filters.search}
              onChange={(event) => dispatch(updateTransactionsFilters({ search: event.target.value }))}
              className="w-full text-xs outline-none"
              placeholder="Search ID or User..."
            />
          </div>
          <select
            aria-label="Filter by type"
            value={filters.type}
            onChange={(event) => dispatch(updateTransactionsFilters({ type: event.target.value as TransactionType | 'All' }))}
            className="h-10 rounded-md border px-3 text-[11px]"
          >
            <option value="All">Type: All Types</option>
            {TRANSACTION_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <select
            aria-label="Filter by date"
            value={filters.dateRange}
            onChange={(event) => dispatch(updateTransactionsFilters({ dateRange: event.target.value as DateRange }))}
            className="h-10 rounded-md border px-3 text-[11px]"
          >
            {DATE_RANGES.map(({ value, label }) => (
              <option key={value} value={value}>
                Date: {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState message="The transactions data could not be loaded." onRetry={() => void refetch()} />
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
                {page.rows.map((t) => (
                  <tr key={t.id} className="table-row hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <Link href={`/transactions/${t.id}`} className="text-[10px] font-semibold hover:text-indigo-600">
                        {t.code}
                      </Link>
                    </td>
                    <td className="px-4 text-[10px]">{t.customer}</td>
                    <td className="px-4">
                      <span className="rounded bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-700">{t.type}</span>
                    </td>
                    <td className={`px-4 text-[10px] font-semibold ${t.amount < 0 ? 'text-red-500' : ''}`}>{formatSignedMoney(t.amount)}</td>
                    <td className="px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 text-[10px] whitespace-nowrap">{formatDateTime(t.timestamp)}</td>
                    <td className="px-4 text-slate-500">
                      <Link href={`/transactions/${t.id}`} aria-label={`View ${t.code}`}>
                        •••
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y md:hidden">
            {page.rows.map((t) => (
              <Link href={`/transactions/${t.id}`} key={t.id} className="block p-4">
                <div className="flex justify-between">
                  <b className="text-xs">{t.code}</b>
                  <StatusBadge status={t.status} />
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-sm">{t.customer}</span>
                  <b className={t.amount < 0 ? 'text-red-500' : ''}>{formatSignedMoney(t.amount)}</b>
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-slate-400">
                  <span>{t.type}</span>
                  <span>{formatDateTime(t.timestamp)}</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} onChange={(next) => dispatch(updateTransactionsFilters({ page: next }))} />
        </div>
      )}
    </div>
  );
}

'use client';

import { ArrowLeftRight, CalendarDays, Users, WalletCards } from 'lucide-react';
import KpiCard from '@/components/common/KpiCard';
import { ErrorState, Skeleton } from '@/components/common/States';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { CURRENT_ADMIN } from '@/lib/constants';
import { formatFullDate, REFERENCE_DATE } from '@/lib/dates';
import { formatNumber, formatWholeMoney } from '@/lib/format';
import { useDashboard } from '@/hooks/queries';
import { useNotifications } from '@/hooks/useNotifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDashboardTab } from '@/store/uiSlice';

const TABS = ['Overview', 'Analytics', 'Reports', 'Settings'];

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((state) => state.ui.dashboardTab);
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <ErrorState message="Please check your internet connection and try again." onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-4">
        <h1 className="text-[22px] font-bold tracking-tight">Welcome back, {CURRENT_ADMIN.firstName}</h1>
        <p className="text-xs text-slate-400">{formatFullDate(REFERENCE_DATE)}</p>
      </div>
      <div className="mb-5 flex gap-6 border-b border-slate-200 text-xs">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => dispatch(setDashboardTab(name))}
            className={`pb-3 ${tab === name ? 'border-b-2 border-indigo-600 font-semibold text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {name}
          </button>
        ))}
      </div>
      {tab !== 'Overview' ? (
        <div className="card flex min-h-64 items-center justify-center p-8 text-center">
          <div>
            <h2 className="text-base font-semibold">{tab}</h2>
            <p className="mt-1 text-xs text-slate-400">This section is available as an interactive dashboard tab.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Users" value={formatNumber(data.totalUsers)} trend={data.trends.users} icon={<Users size={15} />} />
            <KpiCard label="Total Revenue" value={formatWholeMoney(data.revenue)} trend={data.trends.revenue} icon={<WalletCards size={15} />} />
            <KpiCard label="Active Bookings" value={formatNumber(data.activeBookings)} trend={data.trends.bookings} icon={<CalendarDays size={15} />} />
            <KpiCard label="Pending Transactions" value={formatNumber(data.pendingTransactions)} trend={data.trends.pending} icon={<ArrowLeftRight size={15} />} />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-4">
              <RevenueChart points={data.revenueSeries} rangeLabel={data.revenueRange} />
              <RecentTransactions items={data.recentTransactions} total={data.totalTransactions} />
            </div>
            <aside className="space-y-4">
              <Alerts />
              <Health />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function Alerts() {
  const { items } = useNotifications();
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold">System Alerts</h3>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.dot}`} />
            <div>
              <p className="text-[11px] font-semibold">{item.title}</p>
              <p className="text-[10px] text-slate-400">
                {item.subtitle}
                <br />
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Infrastructure metrics: no public API provides these, so they stay static. */
function Health() {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold">System Health</h3>
      <div className="mt-4 space-y-3 text-[10px]">
        <Metric label="Uptime" value="99.8%" />
        <Metric label="Avg Response Time" value="142ms" />
        <Metric label="Active Sessions" value="3,241" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <b>{value}</b>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-36" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[300px]" />
      </div>
    </div>
  );
}

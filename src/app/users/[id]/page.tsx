'use client';

import { Edit3, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useParams } from 'next/navigation';
import Avatar from '@/components/common/Avatar';
import StatusBadge from '@/components/common/StatusBadge';
import { ErrorState, Skeleton } from '@/components/common/States';
import { BackLink, DetailHeader, InfoCard, Timeline } from '@/components/details/DetailParts';
import { formatDate, formatLongDate } from '@/lib/dates';
import { buildUserActivity } from '@/lib/details';
import { formatMoney, userCode } from '@/lib/format';
import { useBookings, useTransactions, useUser } from '@/hooks/queries';
import { useAppDispatch } from '@/store/hooks';
import { openModal } from '@/store/uiSlice';

const VALUE_CLASS = 'text-right font-medium text-slate-700';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const dispatch = useAppDispatch();
  const user = useUser(userId);
  const transactions = useTransactions();
  const bookings = useBookings();

  const queries = [user, transactions, bookings];
  if (queries.some((q) => q.isLoading)) return <Skeleton className="mx-auto h-[600px] max-w-[1180px]" />;
  if (queries.some((q) => q.isError)) {
    return <ErrorState onRetry={() => queries.forEach((q) => q.isError && void q.refetch())} />;
  }
  const u = user.data;
  if (!u) return <ErrorState message="User not found." />;

  const fullName = `${u.firstName} ${u.lastName}`;
  const suspended = u.status === 'Suspended';
  const userTransactions = (transactions.data ?? []).filter((t) => t.userId === u.id).slice(0, 2);
  const activity = buildUserActivity(u, transactions.data ?? [], bookings.data ?? []);

  return (
    <div className="mx-auto max-w-[1180px]">
      <BackLink label={`Users / ${fullName}`} />
      <DetailHeader
        leading={<Avatar src={u.image} name={fullName} className="h-14 w-14 rounded-full object-cover" />}
        title={fullName}
        badges={
          <>
            <StatusBadge status={u.status} />
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">Confirmed</span>
          </>
        }
        subtitle={`${u.email} • Joined ${formatDate(u.joined)}`}
        subtitleSize="text-xs"
        actions={
          <>
            <button
              type="button"
              onClick={() => dispatch(openModal({ kind: 'editUser', userId: u.id }))}
              className="flex items-center gap-1 rounded-md border px-3 py-2 text-[11px] font-semibold"
            >
              <Edit3 size={13} />
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => dispatch(openModal({ kind: 'toggleUserStatus', userId: u.id }))}
              className={`flex items-center gap-1 rounded-md px-3 py-2 text-[11px] font-semibold ${
                suspended ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}
            >
              {suspended ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
              {suspended ? 'Activate User' : 'Suspend User'}
            </button>
          </>
        }
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_310px]">
        <div className="space-y-4">
          <InfoCard
            title="Personal Information"
            layout="centered"
            valueClassName={VALUE_CLASS}
            rows={[
              ['Full Name', fullName],
              ['Email Address', u.email],
              ['Phone Number', u.phone],
              ['Date of Birth', u.dob ? formatLongDate(u.dob) : '—'],
              ['Mailing Address', u.address || '—'],
            ]}
          />
          <InfoCard
            title="Account Information"
            layout="centered"
            valueClassName={VALUE_CLASS}
            rows={[
              ['User ID', userCode(u.id)],
              ['Role', u.role],
              ['Joined Date', formatDate(u.joined)],
              ['Last Login Activity', u.lastActive],
              ['Two-Factor Security', u.twoFA],
            ]}
          />
          <div className="card p-4">
            <h2 className="text-sm font-semibold">{`${u.firstName}'s Recent Transactions`}</h2>
            <div className="mt-3 grid grid-cols-4 border-b pb-2 text-[9px] font-semibold uppercase text-slate-400">
              <span>ID</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {userTransactions.length ? (
              userTransactions.map((t) => (
                <div key={t.id} className="grid grid-cols-4 border-b py-3 text-[10px] last:border-0">
                  <span>{t.code}</span>
                  <span>{formatMoney(t.amount)}</span>
                  <StatusBadge status={t.status} />
                  <span>{formatDate(t.timestamp)}</span>
                </div>
              ))
            ) : (
              <p className="py-3 text-[10px] text-slate-400">No transactions for this user yet.</p>
            )}
          </div>
        </div>
        <div className="card p-4">
          <h2 className="text-sm font-semibold">Recent Activity Log</h2>
          {activity.length ? (
            <Timeline items={activity} compact />
          ) : (
            <p className="mt-4 text-[10px] text-slate-400">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Pencil, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import Avatar from '@/components/common/Avatar';
import KpiCard, { KpiSkeletons } from '@/components/common/KpiCard';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import { EmptyState, ErrorState, TableSkeleton } from '@/components/common/States';
import { ROLES, USER_STATUSES } from '@/lib/constants';
import { filterUsers, paginate } from '@/lib/filters';
import { formatNumber } from '@/lib/format';
import { formatDate } from '@/lib/dates';
import { getUserStats } from '@/lib/stats';
import { useUsers } from '@/hooks/queries';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetUsersFilters, updateUsersFilters } from '@/store/filtersSlice';
import { openModal } from '@/store/uiSlice';
import type { Role, UserStatus } from '@/types';

const TABLE_HEADERS = ['', 'User', 'Role', 'Status', 'Join Date', 'Last Active', 'Actions'];

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters.users);
  const { data: users, isLoading, isError, refetch } = useUsers();

  const stats = useMemo(() => (users ? getUserStats(users) : undefined), [users]);
  const filtered = useMemo(() => filterUsers(users ?? [], filters), [users, filters]);
  const page = paginate(filtered, filters.page);

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        eyebrow="User Management"
        title="Users Directory"
        subtitle="Manage all registered users in your application"
        action={
          <button
            type="button"
            onClick={() => dispatch(openModal({ kind: 'addUser' }))}
            className="hidden items-center gap-1 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 sm:flex"
          >
            <Plus size={14} />
            Add User
          </button>
        }
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {stats ? (
          <>
            <KpiCard label="Total Users" value={formatNumber(stats.total)} trend={stats.trends.total} />
            <KpiCard label="Active Users" value={formatNumber(stats.active)} trend={stats.trends.active} />
            <KpiCard label="New This Month" value={formatNumber(stats.newThisMonth)} trend={stats.trends.newUsers} />
          </>
        ) : (
          !isError && <KpiSkeletons count={3} />
        )}
      </div>

      <div className="mt-4 card p-3">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-slate-200 px-3">
            <Search size={14} className="text-slate-400" />
            <input
              aria-label="Search users"
              value={filters.search}
              onChange={(event) => dispatch(updateUsersFilters({ search: event.target.value }))}
              className="w-full text-xs outline-none"
              placeholder="Search users by name or email..."
            />
          </div>
          <select
            aria-label="Filter by role"
            value={filters.role}
            onChange={(event) => dispatch(updateUsersFilters({ role: event.target.value as Role | 'All' }))}
            className="h-10 rounded-md border border-slate-200 px-3 text-[11px]"
          >
            <option value="All">Role: All</option>
            {ROLES.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(event) => dispatch(updateUsersFilters({ status: event.target.value as UserStatus | 'All' }))}
            className="h-10 rounded-md border border-slate-200 px-3 text-[11px]"
          >
            <option value="All">Status: All</option>
            {USER_STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => dispatch(resetUsersFilters())}
            className="flex h-10 items-center justify-center gap-1 rounded-md border border-slate-200 px-3 text-[11px] text-slate-600"
          >
            <SlidersHorizontal size={13} />
            Reset
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState message="The users API could not be reached." onRetry={() => void refetch()} />
      ) : !page.rows.length ? (
        <EmptyState />
      ) : (
        <div className="mt-4 card overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[9px] uppercase text-slate-500">
                <tr>
                  {TABLE_HEADERS.map((header, index) => (
                    <th key={index} className="px-4 py-3 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.rows.map((user) => (
                  <tr key={user.id} className="table-row hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <input type="checkbox" aria-label={`Select ${user.firstName} ${user.lastName}`} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/users/${user.id}`} className="flex items-center gap-2">
                        <Avatar src={user.image} name={`${user.firstName} ${user.lastName}`} className="h-8 w-8 rounded-full object-cover" />
                        <span>
                          <b className="block text-[11px]">
                            {user.firstName} {user.lastName}
                          </b>
                          <small className="text-[9px] text-slate-400">{user.email}</small>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4">
                      <span className="rounded bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-700">{user.role}</span>
                    </td>
                    <td className="px-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 text-[10px] whitespace-nowrap">{formatDate(user.joined)}</td>
                    <td className="px-4 text-[10px] whitespace-nowrap">{user.lastActive}</td>
                    <td className="px-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label={`Edit ${user.firstName} ${user.lastName}`}
                          className="text-slate-500 hover:text-indigo-600"
                          onClick={() => dispatch(openModal({ kind: 'editUser', userId: user.id }))}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${user.firstName} ${user.lastName}`}
                          className="text-red-400 hover:text-red-600"
                          onClick={() => dispatch(openModal({ kind: 'deleteUser', userId: user.id }))}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y md:hidden">
            {page.rows.map((user) => (
              <Link href={`/users/${user.id}`} key={user.id} className="flex items-center gap-3 p-4">
                <Avatar src={user.image} name={`${user.firstName} ${user.lastName}`} className="h-10 w-10 rounded-full" />
                <div className="min-w-0 flex-1">
                  <b className="block text-sm">
                    {user.firstName} {user.lastName}
                  </b>
                  <span className="block truncate text-[10px] text-slate-400">{user.email}</span>
                  <div className="mt-1 flex gap-2">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] text-indigo-700">{user.role}</span>
                    <StatusBadge status={user.status} />
                  </div>
                </div>
                <span className="text-[9px] text-slate-400">{user.lastActive}</span>
              </Link>
            ))}
          </div>
          <Pagination page={page} onChange={(next) => dispatch(updateUsersFilters({ page: next }))} />
        </div>
      )}
    </div>
  );
}

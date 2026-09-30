'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/hooks/queries';
import { useAppSelector } from '@/store/hooks';

export interface AppNotification {
  id: string;
  dot: string;
  title: string;
  subtitle: string;
  time: string;
}

/**
 * System alerts. The pending-transactions alert is computed from API-derived
 * data; capacity and maintenance notices have no public API and stay static.
 */
export function useNotifications() {
  const { data: transactions } = useTransactions();
  const readIds = useAppSelector((state) => state.notifications.readIds);

  const items = useMemo<AppNotification[]>(() => {
    const pending = transactions?.filter((t) => t.status === 'Pending').length;
    return [
      { id: 'capacity', dot: 'bg-red-500', title: 'Server capacity at 92%', subtitle: 'Scale resources', time: '2 hours ago' },
      {
        id: 'pending',
        dot: 'bg-amber-400',
        title: pending === undefined ? 'Transactions pending' : `${pending} transactions pending`,
        subtitle: 'Pending review',
        time: '5 hours ago',
      },
      { id: 'maintenance', dot: 'bg-blue-500', title: 'System maintenance scheduled', subtitle: 'Scheduled for Oct 5', time: 'Yesterday' },
    ];
  }, [transactions]);

  return { items, unread: items.filter((item) => !readIds.includes(item.id)).length };
}

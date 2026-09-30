'use client';

import { queryOptions, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchProducts, fetchUsers } from '@/lib/api';
import { buildBookings, buildTransactions } from '@/lib/mappers';
import { buildDashboardData } from '@/lib/stats';

export const queryKeys = {
  users: ['users'] as const,
  products: ['products'] as const,
  transactions: ['transactions'] as const,
  bookings: ['bookings'] as const,
};

const usersOptions = queryOptions({
  queryKey: queryKeys.users,
  queryFn: ({ signal }) => fetchUsers(signal),
});

const productsOptions = queryOptions({
  queryKey: queryKeys.products,
  queryFn: ({ signal }) => fetchProducts(signal),
});

/**
 * Transactions and bookings are derived from the users + products resources.
 * `ensureQueryData` reuses the cache, so those two endpoints are requested once
 * no matter how many pages need them.
 */
async function loadSource(queryClient: QueryClient) {
  const [users, products] = await Promise.all([
    queryClient.ensureQueryData(usersOptions),
    queryClient.ensureQueryData(productsOptions),
  ]);
  return { users, products };
}

const transactionsOptions = (queryClient: QueryClient) =>
  queryOptions({
    queryKey: queryKeys.transactions,
    queryFn: async () => {
      const { users, products } = await loadSource(queryClient);
      return buildTransactions(users, products);
    },
  });

const bookingsOptions = (queryClient: QueryClient) =>
  queryOptions({
    queryKey: queryKeys.bookings,
    queryFn: async () => {
      const { users, products } = await loadSource(queryClient);
      return buildBookings(users, products);
    },
  });

export const useUsers = () => useQuery(usersOptions);
export const useUser = (id: number) =>
  useQuery({ ...usersOptions, select: (users) => users.find((user) => user.id === id) });

export const useTransactions = () => useQuery(transactionsOptions(useQueryClient()));
export const useTransaction = (id: number) =>
  useQuery({ ...transactionsOptions(useQueryClient()), select: (list) => list.find((item) => item.id === id) });

export const useBookings = () => useQuery(bookingsOptions(useQueryClient()));
export const useBooking = (id: number) =>
  useQuery({ ...bookingsOptions(useQueryClient()), select: (list) => list.find((item) => item.id === id) });

/** KPIs, chart series and recent transactions, all computed from the three cached queries. */
export function useDashboard() {
  const users = useUsers();
  const transactions = useTransactions();
  const bookings = useBookings();

  const data = useMemo(
    () =>
      users.data && transactions.data && bookings.data
        ? buildDashboardData(users.data, transactions.data, bookings.data)
        : undefined,
    [users.data, transactions.data, bookings.data],
  );

  const queries = [users, transactions, bookings];
  return {
    data,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    refetch: () => queries.forEach((query) => query.isError && void query.refetch()),
  };
}

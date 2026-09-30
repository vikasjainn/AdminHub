'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUserRequest, deleteUserRequest, updateUserRequest } from '@/lib/api';
import { SERVICE_RATES } from '@/lib/constants';
import { isoDate, isoFromReference } from '@/lib/dates';
import { queryKeys } from '@/hooks/queries';
import { useAppDispatch } from '@/store/hooks';
import { closeModal, showToast } from '@/store/uiSlice';
import type { Booking, ServiceType, Transaction, User } from '@/types';

export type UserFormValues = Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'role' | 'status'>;

export interface NewBookingValues {
  userId: number;
  service: ServiceType;
  date: string;
  time: string;
}

function useFeedback() {
  const dispatch = useAppDispatch();
  return {
    success: (message: string) => {
      dispatch(closeModal());
      dispatch(showToast({ message, tone: 'success' }));
    },
    error: (error: Error) => dispatch(showToast({ message: error.message, tone: 'error' })),
  };
}

/**
 * User writes go to DummyJSON's simulated endpoints (they answer but never
 * persist), then the TanStack Query cache is updated so the UI reflects them.
 */
export function useUserMutations() {
  const queryClient = useQueryClient();
  const feedback = useFeedback();

  const readUsers = () => queryClient.getQueryData<User[]>(queryKeys.users) ?? [];
  const writeUsers = (update: (users: User[]) => User[]) =>
    queryClient.setQueryData<User[]>(queryKeys.users, (users = []) => update(users));
  const replaceUser = (user: User) => writeUsers((users) => users.map((u) => (u.id === user.id ? user : u)));

  const create = useMutation({
    mutationFn: async (values: UserFormValues): Promise<User> => {
      await createUserRequest(values);
      return {
        ...values,
        id: Math.max(0, ...readUsers().map((u) => u.id)) + 1,
        image: '',
        joined: isoDate(isoFromReference(0)),
        lastActive: 'Just now',
        dob: '',
        address: '',
        twoFA: 'Disabled',
        local: true,
      };
    },
    onSuccess: (user) => {
      writeUsers((users) => [user, ...users]);
      feedback.success(`${user.firstName} ${user.lastName} was added`);
    },
    onError: feedback.error,
  });

  const update = useMutation({
    mutationFn: async ({ user, patch }: { user: User; patch: Partial<User> }): Promise<User> => {
      if (!user.local) await updateUserRequest(user.id, patch);
      return { ...user, ...patch };
    },
    onSuccess: (user) => {
      replaceUser(user);
      feedback.success(`${user.firstName} ${user.lastName} was updated`);
    },
    onError: feedback.error,
  });

  const remove = useMutation({
    mutationFn: async (user: User): Promise<User> => {
      if (!user.local) await deleteUserRequest(user.id);
      return user;
    },
    onSuccess: (user) => {
      writeUsers((users) => users.filter((u) => u.id !== user.id));
      feedback.success(`${user.firstName} ${user.lastName} was deleted`);
    },
    onError: feedback.error,
  });

  return { create, update, remove };
}

/**
 * DummyJSON has no transaction or booking resources, so these actions edit the
 * cached, API-derived records directly.
 */
export function useLedgerActions() {
  const queryClient = useQueryClient();
  const feedback = useFeedback();

  const patchTransaction = (id: number, patch: Partial<Transaction>) =>
    queryClient.setQueryData<Transaction[]>(queryKeys.transactions, (list = []) =>
      list.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  const patchBooking = (id: number, patch: Partial<Booking>) =>
    queryClient.setQueryData<Booking[]>(queryKeys.bookings, (list = []) =>
      list.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );

  return {
    refundTransaction: (transaction: Transaction) => {
      patchTransaction(transaction.id, { status: 'Refunded' });
      feedback.success(`${transaction.code} was refunded`);
    },
    rescheduleBooking: (booking: Booking, date: string, time: string) => {
      patchBooking(booking.id, { date, time, status: booking.status === 'Pending' ? 'Pending' : 'Confirmed' });
      feedback.success(`${booking.code} was rescheduled`);
    },
    cancelBooking: (booking: Booking) => {
      patchBooking(booking.id, { status: 'Cancelled' });
      feedback.success(`${booking.code} was cancelled`);
    },
    createBooking: (values: NewBookingValues, customer: User) => {
      queryClient.setQueryData<Booking[]>(queryKeys.bookings, (list = []) => {
        const id = Math.max(2000, ...list.map((b) => b.id)) + 1;
        const booking: Booking = {
          id,
          code: `#BKG-${id}`,
          userId: customer.id,
          customer: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          productTitle: 'Manual booking',
          productCategory: 'services',
          service: values.service,
          date: values.date,
          time: values.time,
          durationHours: 1,
          status: 'Confirmed',
          amount: SERVICE_RATES[values.service],
          createdAt: isoFromReference(0, 12),
        };
        return [booking, ...list];
      });
      feedback.success('Booking created');
    },
  };
}

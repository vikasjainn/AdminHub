import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BookingsFilters, ListRoute, TransactionsFilters, UsersFilters } from '@/types';

interface FiltersState {
  users: UsersFilters;
  transactions: TransactionsFilters;
  bookings: BookingsFilters;
}

const initialState: FiltersState = {
  users: { search: '', role: 'All', status: 'All', page: 1 },
  transactions: { search: '', type: 'All', dateRange: '30d', page: 1 },
  bookings: { search: '', status: 'All', service: 'All', dateRange: '30d', page: 1 },
};

/** Any filter change other than an explicit page change returns to page 1. */
const merge = <T extends { page: number }>(current: T, patch: Partial<T>): T => ({
  ...current,
  ...patch,
  page: patch.page ?? 1,
});

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    updateUsersFilters: (state, action: PayloadAction<Partial<UsersFilters>>) => {
      state.users = merge(state.users, action.payload);
    },
    updateTransactionsFilters: (state, action: PayloadAction<Partial<TransactionsFilters>>) => {
      state.transactions = merge(state.transactions, action.payload);
    },
    updateBookingsFilters: (state, action: PayloadAction<Partial<BookingsFilters>>) => {
      state.bookings = merge(state.bookings, action.payload);
    },
    resetUsersFilters: (state) => {
      state.users = initialState.users;
    },
    /** Used by the header "Search console". */
    applyConsoleSearch: (state, action: PayloadAction<{ target: ListRoute; query: string }>) => {
      state[action.payload.target].search = action.payload.query;
      state[action.payload.target].page = 1;
    },
  },
});

export const {
  updateUsersFilters,
  updateTransactionsFilters,
  updateBookingsFilters,
  resetUsersFilters,
  applyConsoleSearch,
} = filtersSlice.actions;
export default filtersSlice.reducer;

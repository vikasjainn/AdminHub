import { configureStore } from '@reduxjs/toolkit';
import filters from '@/store/filtersSlice';
import notifications from '@/store/notificationsSlice';
import ui from '@/store/uiSlice';

/** Redux holds client/UI state only. Server data lives in the TanStack Query cache. */
export const store = configureStore({ reducer: { ui, filters, notifications } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

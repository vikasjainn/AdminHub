import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { readIds: [] as string[] },
  reducers: {
    markAllRead: (state, action: PayloadAction<string[]>) => {
      state.readIds = Array.from(new Set([...state.readIds, ...action.payload]));
    },
  },
});

export const { markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;

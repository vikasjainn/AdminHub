import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MenuName, ModalState, Toast } from '@/types';

interface UiState {
  mobileNav: boolean;
  openMenu: MenuName | null;
  dashboardTab: string;
  modal: ModalState | null;
  toast: Toast | null;
}

const initialState: UiState = { mobileNav: false, openMenu: null, dashboardTab: 'Overview', modal: null, toast: null };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMobileNav: (state, action: PayloadAction<boolean>) => {
      state.mobileNav = action.payload;
    },
    toggleMenu: (state, action: PayloadAction<MenuName>) => {
      state.openMenu = state.openMenu === action.payload ? null : action.payload;
    },
    openMenu: (state, action: PayloadAction<MenuName>) => {
      state.openMenu = action.payload;
    },
    closeMenu: (state) => {
      state.openMenu = null;
    },
    setDashboardTab: (state, action: PayloadAction<string>) => {
      state.dashboardTab = action.payload;
    },
    openModal: (state, action: PayloadAction<ModalState>) => {
      state.modal = action.payload;
    },
    closeModal: (state) => {
      state.modal = null;
    },
    showToast: (state, action: PayloadAction<Pick<Toast, 'message' | 'tone'>>) => {
      state.toast = { id: (state.toast?.id ?? 0) + 1, ...action.payload };
    },
    dismissToast: (state) => {
      state.toast = null;
    },
  },
});

export const { setMobileNav, toggleMenu, openMenu, closeMenu, setDashboardTab, openModal, closeModal, showToast, dismissToast } =
  uiSlice.actions;
export default uiSlice.reducer;

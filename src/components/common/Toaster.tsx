'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { dismissToast } from '@/store/uiSlice';

const TONE_DOTS = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-blue-500' } as const;

export default function Toaster() {
  const toast = useAppSelector((state) => state.ui.toast);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(dismissToast()), 3500);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;
  return (
    <div
      role="status"
      className="card fixed bottom-24 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 px-4 py-3 text-xs font-medium text-slate-700 shadow-xl md:bottom-6 md:left-auto md:right-6 md:translate-x-0"
    >
      <span className={`h-2 w-2 rounded-full ${TONE_DOTS[toast.tone]}`} />
      {toast.message}
    </div>
  );
}

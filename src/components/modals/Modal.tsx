'use client';

import { useEffect, useId, type ReactNode } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { closeModal } from '@/store/uiSlice';

export const CONTROL_CLASS =
  'mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs outline-none focus:border-indigo-400';
export const SECONDARY_BUTTON = 'rounded-md border px-3 py-2 text-[11px] font-semibold disabled:opacity-40';
export const PRIMARY_BUTTON =
  'rounded-md bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-40';
export const DANGER_BUTTON =
  'rounded-md bg-red-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-40';

interface ModalProps {
  title: string;
  description?: string;
  children?: ReactNode;
  footer: ReactNode;
}

export default function Modal({ title, description, children, footer }: ModalProps) {
  const dispatch = useAppDispatch();
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && dispatch(closeModal());
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [dispatch]);

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/40 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && dispatch(closeModal())}
    >
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="card w-full max-w-[420px] p-5">
        <h2 id={titleId} className="text-sm font-semibold">
          {title}
        </h2>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        {children && <div className="mt-4 space-y-3">{children}</div>}
        <div className="mt-5 flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-[11px] font-medium text-slate-500">
      {label}
      {children}
      {error && <span className="mt-1 block text-[10px] font-normal text-red-500">{error}</span>}
    </label>
  );
}

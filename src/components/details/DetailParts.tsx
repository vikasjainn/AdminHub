'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { TimelineEntry } from '@/lib/details';

export function BackLink({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 flex items-center gap-2 text-[11px] text-slate-500 hover:text-indigo-600 print:hidden"
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  );
}

interface DetailHeaderProps {
  leading: ReactNode;
  title: string;
  badges?: ReactNode;
  subtitle: string;
  subtitleSize?: 'text-xs' | 'text-[10px]';
  actions: ReactNode;
}

export function DetailHeader({ leading, title, badges, subtitle, subtitleSize = 'text-[10px]', actions }: DetailHeaderProps) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {leading}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold">{title}</h1>
            {badges}
          </div>
          <p className={`mt-1 ${subtitleSize} text-slate-400`}>{subtitle}</p>
        </div>
        <div className="flex gap-2 print:hidden">{actions}</div>
      </div>
    </div>
  );
}

const ROW_LAYOUTS = {
  centered: 'flex items-center justify-between gap-4 py-2.5 text-[10px]',
  top: 'flex justify-between gap-5 py-2.5 text-[10px]',
} as const;

interface InfoCardProps {
  title: string;
  rows: [label: string, value: string][];
  layout?: keyof typeof ROW_LAYOUTS;
  valueClassName?: string;
}

export function InfoCard({ title, rows, layout = 'top', valueClassName = 'text-right font-medium' }: InfoCardProps) {
  return (
    <div className="card p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className={ROW_LAYOUTS[layout]}>
            <span className="text-slate-400">{label}</span>
            <span className={valueClassName}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const DOT_COLORS = { success: 'bg-emerald-500', danger: 'bg-red-500', default: 'bg-indigo-500' } as const;

export function Timeline({ items, compact = false }: { items: TimelineEntry[]; compact?: boolean }) {
  const layout = compact
    ? 'space-y-5 before:bottom-1 before:top-1'
    : 'space-y-6 before:bottom-2 before:top-2';
  return (
    <div className={`relative mt-4 pl-5 before:absolute before:left-[5px] before:w-px before:bg-indigo-100 ${layout}`}>
      {items.map((item) => (
        <div key={`${item.title}-${item.time}`} className="relative">
          <span
            className={`absolute -left-[20px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${DOT_COLORS[item.tone ?? 'default']}`}
          />
          <p className="text-[11px] font-semibold">{item.title}</p>
          <p className="text-[10px] text-slate-400">{item.description}</p>
          <p className="text-[9px] text-slate-400">{item.time}</p>
        </div>
      ))}
    </div>
  );
}

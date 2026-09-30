import type { ReactNode } from 'react';
import type { Trend } from '@/types';
import { Skeleton } from '@/components/common/States';

const TREND_STYLES = {
  up: { color: 'text-emerald-500', arrow: '↑' },
  down: { color: 'text-red-500', arrow: '↓' },
  neutral: { color: 'text-slate-400', arrow: '→' },
} as const;

interface KpiCardProps {
  label: string;
  value: string;
  trend: Trend;
  icon?: ReactNode;
}

export default function KpiCard({ label, value, trend, icon }: KpiCardProps) {
  const { color, arrow } = TREND_STYLES[trend.direction];
  return (
    <div className="card min-h-[112px] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
        {icon && <span className="text-indigo-500">{icon}</span>}
      </div>
      <div className="mt-3 text-[24px] font-bold leading-none tracking-tight text-slate-900">{value}</div>
      <div className={`mt-2 text-[10px] font-medium ${color}`}>
        {arrow} {trend.value}% <span className="font-normal text-slate-400">vs last month</span>
      </div>
    </div>
  );
}

export function KpiSkeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-[112px]" />
      ))}
    </>
  );
}

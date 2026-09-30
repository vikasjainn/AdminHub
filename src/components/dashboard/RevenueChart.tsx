'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RevenuePoint } from '@/types';

const RANGES = ['7D', '1M', '3M', '6M', '1Y'];
const ACTIVE_RANGE = '6M';

interface RevenueChartProps {
  points: RevenuePoint[];
  rangeLabel: string;
}

export default function RevenueChart({ points, rangeLabel }: RevenueChartProps) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Revenue Overview</h3>
          <p className="mt-0.5 text-[10px] text-slate-400">{rangeLabel}</p>
        </div>
        <div className="flex gap-1 text-[9px] text-slate-400">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              className={`rounded px-1.5 py-1 ${range === ACTIVE_RANGE ? 'bg-slate-100 font-semibold text-slate-700' : ''}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
            <YAxis
              domain={[0, 'auto']}
              tickCount={5}
              tickFormatter={(value: number) => `$${value}K`}
              tick={{ fontSize: 9, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [`$${value}K`, 'Revenue']}
              contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4F46E5"
              strokeWidth={2}
              fill="url(#revenueFill)"
              dot={{ r: 2, fill: '#4F46E5', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

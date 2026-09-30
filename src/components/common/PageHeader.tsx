import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="mb-1 text-[10px] font-medium text-slate-400">{eyebrow}</div>
        <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

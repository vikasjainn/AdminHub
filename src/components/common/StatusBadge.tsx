const STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  Confirmed: 'bg-emerald-50 text-emerald-700',
  Paid: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Processing: 'bg-blue-50 text-blue-700',
  Failed: 'bg-red-50 text-red-700',
  Cancelled: 'bg-red-50 text-red-700',
  Suspended: 'bg-red-50 text-red-700',
  Inactive: 'bg-amber-50 text-amber-700',
  Refunded: 'bg-slate-100 text-slate-600',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold leading-none ${STYLES[status] || 'bg-slate-100 text-slate-600'}`}
    >
      {status}
    </span>
  );
}

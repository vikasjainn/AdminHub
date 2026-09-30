import { MoreHorizontal, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/dates';
import { formatMoney } from '@/lib/format';
import type { Transaction } from '@/types';

const HEADERS = ['Transaction ID', 'User', 'Amount', 'Status', 'Date', 'Action'];

interface RecentTransactionsProps {
  items: Transaction[];
  total: number;
}

export default function RecentTransactions({ items, total }: RecentTransactionsProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold">Recent Transactions</h3>
        <Link
          href="/transactions"
          className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[10px] text-slate-600"
        >
          <SlidersHorizontal size={11} />
          Filter
        </Link>
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-[10px]">
          <thead className="bg-slate-50 text-[9px] uppercase text-slate-500">
            <tr>
              {HEADERS.map((header) => (
                <th key={header} className="px-3 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 6).map((t) => (
              <tr key={t.id} className="table-row">
                <td className="px-3 py-3">
                  <Link className="font-semibold text-slate-700 hover:text-indigo-600" href={`/transactions/${t.id}`}>
                    {t.code}
                  </Link>
                </td>
                <td className="px-3">{t.customer}</td>
                <td className="px-3 font-semibold">{formatMoney(t.amount)}</td>
                <td className="px-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-3 whitespace-nowrap">{formatDate(t.timestamp)}</td>
                <td className="px-3">
                  <Link href={`/transactions/${t.id}`} aria-label={`View ${t.code}`}>
                    <MoreHorizontal size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y md:hidden">
        {items.slice(0, 3).map((t) => (
          <Link href={`/transactions/${t.id}`} key={t.id} className="flex items-center justify-between p-3">
            <div>
              <p className="text-xs font-semibold">{t.customer}</p>
              <p className="text-[9px] text-slate-400">
                {t.code} · {formatDate(t.timestamp)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold">{formatMoney(t.amount)}</p>
              <StatusBadge status={t.status} />
            </div>
          </Link>
        ))}
      </div>
      <div className="border-t border-slate-100 px-4 py-2 text-[9px] text-slate-400">
        Showing 1-{Math.min(6, items.length)} of {total} results
      </div>
    </div>
  );
}

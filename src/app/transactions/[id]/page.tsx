'use client';

import { Printer, RotateCcw } from 'lucide-react';
import { useParams } from 'next/navigation';
import StatusBadge from '@/components/common/StatusBadge';
import { ErrorState, Skeleton } from '@/components/common/States';
import { BackLink, DetailHeader, InfoCard, Timeline } from '@/components/details/DetailParts';
import { buildTransactionTimeline, describeTransaction } from '@/lib/details';
import { formatMoney, userCode } from '@/lib/format';
import { useTransaction, useTransactions } from '@/hooks/queries';
import { useAppDispatch } from '@/store/hooks';
import { openModal } from '@/store/uiSlice';

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const transaction = useTransaction(Number(id));
  const all = useTransactions();

  if (transaction.isLoading) return <Skeleton className="mx-auto h-[600px] max-w-[1180px]" />;
  if (transaction.isError) return <ErrorState onRetry={() => void transaction.refetch()} />;
  const t = transaction.data;
  if (!t) return <ErrorState message="Transaction not found." />;

  const details = describeTransaction(t);
  const related = (all.data ?? []).filter((x) => x.userId === t.userId && x.id !== t.id).slice(0, 2);
  const refundable = t.status === 'Completed' && t.type !== 'Refund';

  return (
    <div className="mx-auto max-w-[1180px]">
      <BackLink label={`Transactions / ${t.code}`} />
      <DetailHeader
        leading={<div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-emerald-600">↔</div>}
        title={`Transaction ${t.code}`}
        badges={<StatusBadge status={t.status} />}
        subtitle={`Reference ${details.reference} • Generated on ${details.generatedOn}`}
        actions={
          <>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1 rounded-md border px-3 py-2 text-[11px]"
            >
              <Printer size={13} />
              Print Receipt
            </button>
            <button
              type="button"
              disabled={!refundable}
              title={refundable ? undefined : 'Only completed payments can be refunded'}
              onClick={() => dispatch(openModal({ kind: 'refundTransaction', transactionId: t.id }))}
              className="flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={13} />
              Refund Transaction
            </button>
          </>
        }
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_310px]">
        <div className="space-y-4">
          <InfoCard
            title="Transaction Invoice Details"
            rows={[
              ['Transaction Type', details.typeLabel],
              ['Payment Method', details.paymentMethod],
              ['Processing Gateway Fee', formatMoney(details.fee)],
              ['Subtotal', formatMoney(details.subtotal)],
              ['Grand Total', formatMoney(details.total)],
            ]}
          />
          <InfoCard
            title="Customer Profile"
            rows={[
              ['Customer', t.customer],
              ['Email', t.email],
              ['Account ID', userCode(t.userId)],
            ]}
          />
          <div className="card p-4">
            <h2 className="text-sm font-semibold">Related Customer Ledger Entries</h2>
            <div className="mt-3 grid grid-cols-4 border-b pb-2 text-[9px] font-semibold uppercase text-slate-400">
              <span>Transaction ID</span>
              <span>Gateway Method</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {related.length ? (
              related.map((x) => (
                <div key={x.id} className="grid grid-cols-4 border-b py-3 text-[10px] last:border-0">
                  <span>{x.code}</span>
                  <span>{describeTransaction(x).gateway}</span>
                  <span>{formatMoney(x.amount)}</span>
                  <StatusBadge status={x.status} />
                </div>
              ))
            ) : (
              <p className="py-3 text-[10px] text-slate-400">No other transactions for this customer.</p>
            )}
          </div>
        </div>
        <div className="card p-4">
          <h2 className="text-sm font-semibold">Processing History</h2>
          <Timeline items={buildTransactionTimeline(t)} />
        </div>
      </div>
    </div>
  );
}

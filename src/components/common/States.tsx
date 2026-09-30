export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className}`} />;
}

export function TableSkeleton({ rowClassName = 'h-10', rows = 8 }: { rowClassName?: string; rows?: number }) {
  return (
    <div className="mt-4 card p-4 space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={rowClassName} />
      ))}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong while loading this data.', onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="card mt-4 flex min-h-36 flex-col items-center justify-center p-6 text-center">
      <p className="text-sm font-semibold text-slate-700">Unable to load data</p>
      <p className="mt-1 text-xs text-slate-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring mt-3 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = 'No records found for the selected filters.' }: { message?: string }) {
  return (
    <div className="card mt-4 flex min-h-36 flex-col items-center justify-center p-6 text-center">
      <p className="text-sm font-semibold text-slate-700">No results</p>
      <p className="mt-1 text-xs text-slate-400">{message}</p>
    </div>
  );
}

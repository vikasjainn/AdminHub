import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Page } from '@/lib/filters';

interface PaginationProps {
  page: Page<unknown>;
  onChange: (page: number) => void;
}

export default function Pagination({ page, onChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-[10px] text-slate-400">
      <span>
        Showing {page.from}-{page.to} of {page.total} results
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page.page === 1}
          onClick={() => onChange(page.page - 1)}
          className="rounded border px-2 py-1 disabled:opacity-40"
        >
          <ChevronLeft size={13} />
        </button>
        <button
          type="button"
          aria-label="Next page"
          disabled={page.page === page.pages}
          onClick={() => onChange(page.page + 1)}
          className="rounded border px-2 py-1 disabled:opacity-40"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

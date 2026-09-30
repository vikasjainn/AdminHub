'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

/**
 * DummyJSON serves a static dataset, so responses never go stale. Data is
 * fetched once, kept for the session, and re-requested only on Retry.
 * That also keeps in-app edits (refund, reschedule, ...) in the cache.
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: Infinity, gcTime: Infinity, retry: 1, refetchOnWindowFocus: false },
    },
  });
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}

'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import { ApiError, retryRead } from '@/lib/api/client';

export function Providers({ children }: { children: React.ReactNode }) {
  const departing = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20_000,
            retry: retryRead,
            refetchOnWindowFocus: true,
          },
          mutations: { retry: false },
        },
      }),
  );
  useEffect(() => {
    function leave(destination: string) {
      if (departing.current) return;
      departing.current = true;
      setLeaving(true);
      void client.cancelQueries();
      // Unmount observers before clearing; mounted observers could immediately refetch.
      window.setTimeout(() => {
        client.clear();
        window.location.replace(destination);
      }, 0);
    }
    function invalid(event: Event) {
      const error = (event as CustomEvent<ApiError>).detail;
      leave(
        error.status === 401
          ? '/login?reason=expired'
          : error.code === 'ACCOUNT_INACTIVE'
            ? '/status'
            : '/access-denied',
      );
    }
    const explicitLeave = (event: Event) =>
      leave((event as CustomEvent<string>).detail);
    window.addEventListener('session-invalid', invalid);
    window.addEventListener('session-leave', explicitLeave);
    // Browser history can restore a private page from bfcache after logout.
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) {
        client.clear();
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', restored);
    return () => {
      window.removeEventListener('session-invalid', invalid);
      window.removeEventListener('session-leave', explicitLeave);
      window.removeEventListener('pageshow', restored);
    };
  }, [client]);
  return (
    <QueryClientProvider client={client}>
      {leaving ? (
        <main className="p-8" role="status">
          Updating your session…
        </main>
      ) : (
        children
      )}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

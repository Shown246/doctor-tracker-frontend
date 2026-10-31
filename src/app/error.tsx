'use client';
import { ErrorState } from '@/components/shared';
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-5">Unable to load this page</h1>
      <ErrorState
        error={
          new Error('The service is temporarily unavailable. Please try again.')
        }
        retry={reset}
      />
    </main>
  );
}

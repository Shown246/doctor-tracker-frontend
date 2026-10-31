'use client';
import { useState } from 'react';
import { AlertCircle, ArrowRight, Inbox, LoaderCircle } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { title } from '@/lib/utils';
import { Button } from './ui/button';
import { Modal } from './ui/dialog';

export function PageHeading({
  title: heading,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">DOCTOR TRACKER</p>
        <h1>{heading}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function Badge({ value }: { value: string }) {
  return <span className={`badge badge-${value}`}>{title(value)}</span>;
}
export function Loading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4">
      <span className="sr-only">Loading…</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl bg-slate-200/70"
        />
      ))}
    </div>
  );
}
export function Empty({
  message = 'No records found. Try another search or clear your filters.',
}: {
  message?: string;
}) {
  return (
    <div className="empty">
      <Inbox className="mx-auto mb-3 size-8 text-slate-400" />
      <p>{message}</p>
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const conflict = error instanceof ApiError && error.status === 409;
  const missing = error instanceof ApiError && error.status === 404;
  return (
    <div role="alert" aria-label="Request error" className="error-state">
      <AlertCircle className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-semibold">
          {conflict
            ? 'This record needs review'
            : missing
              ? 'Record unavailable'
              : 'Something needs your attention'}
        </p>
        <p className="mt-1 text-sm">
          {conflict
            ? `${error.message}. Load the latest version and review your changes before saving again.`
            : missing
              ? 'The record may have been removed or your access changed.'
              : error instanceof Error
                ? error.message
                : 'Please try again.'}
        </p>
        {error instanceof ApiError && error.requestId && (
          <p className="mt-2 break-all text-xs">Reference: {error.requestId}</p>
        )}
        {retry && (
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={retry}
          >
            {conflict ? 'Load latest version' : 'Try again'}
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
export function Submit({
  busy,
  children = 'Save changes',
}: {
  busy: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Button disabled={busy} type="submit">
      {busy && <LoaderCircle className="animate-spin" />}
      {busy ? 'Saving…' : children}
    </Button>
  );
}
export function Confirm({
  label,
  title,
  description,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  onConfirm: () => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setError(undefined);
          setOpen(true);
        }}
      >
        {label}
      </Button>
      <Modal
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value);
        }}
        title={title}
        description={description}
      >
        {!!error && <ErrorState error={error} />}
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                setOpen(false);
              } catch (err) {
                setError(err);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Please wait…' : title}
          </Button>
        </div>
      </Modal>
    </>
  );
}
export function DetailGrid({
  values,
}: {
  values: Record<string, React.ReactNode>;
}) {
  return (
    <dl className="detail-grid">
      {Object.entries(values).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value || 'Not provided'}</dd>
        </div>
      ))}
    </dl>
  );
}

'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, body, queryKeys } from '@/lib/api/client';
import type { Doctor, Patient, Schema } from '@/lib/api/types';
import { dateTime, title } from '@/lib/utils';
import { useAccount } from './account-context';
import {
  Badge,
  Card,
  DetailGrid,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
} from './shared';
import { ListControls, Pagination, RecordPicker, useListState } from './lists';
import { RecordForm, clinicalFields } from './forms';
import { useRefresh } from './management';
import { Button } from './ui/button';

export function RegistrationsPage() {
  const account = useAccount();
  const { query, change } = useListState(['page', 'limit', 'role', 'status']);
  const result = useQuery({
    queryKey: [...queryKeys.resource(account.id, 'registrations'), query],
    queryFn: async ({ signal }) =>
      body(await api.GET('/registrations', { params: { query }, signal })),
  });
  return (
    <>
      <PageHeading
        title="Registration review"
        description="Review requests and connect approved accounts with their doctor or patient profile."
      />
      <Card>
        <ListControls kind="patients" registration />
        {result.isPending ? (
          <Loading />
        ) : result.isError ? (
          <ErrorState
            error={result.error}
            retry={() => void result.refetch()}
          />
        ) : (
          <>
            {!result.data.data.length ? (
              <Empty message="No registrations match these filters." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.data.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <Link
                            className="record-link"
                            href={`/admin/registrations/${r.id}`}
                          >
                            {r.name}
                          </Link>
                          <span className="mt-1 block text-xs text-slate-500">
                            {r.email}
                          </span>
                        </td>
                        <td>{title(r.role)}</td>
                        <td>
                          <Badge value={r.status} />
                        </td>
                        <td>{dateTime(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              meta={result.data.meta}
              onChange={(p) => change('page', String(p))}
            />
          </>
        )}
      </Card>
    </>
  );
}
export function RegistrationReview({ id }: { id: string }) {
  const account = useAccount();
  const refresh = useRefresh();
  const [mode, setMode] = useState<'create' | 'link'>('create');
  const [selected, setSelected] = useState<Doctor | Patient>();
  const [actionError, setActionError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const result = useQuery({
    queryKey: [...queryKeys.resource(account.id, 'registrations'), id],
    queryFn: async ({ signal }) =>
      body(
        await api.GET('/registrations/{id}', {
          params: { path: { id } },
          signal,
        }),
      ).data,
  });
  if (result.isPending) return <Loading />;
  if (result.isError)
    return (
      <ErrorState error={result.error} retry={() => void result.refetch()} />
    );
  const r = result.data;
  const decision = async (input: Schema['RegistrationDecision']) => {
    await api.PUT('/registrations/{id}/decision', {
      params: { path: { id } },
      body: input,
    });
    await refresh(['registrations', 'doctors', 'patients', 'dashboard']);
    toast.success(
      input.decision === 'approve'
        ? 'Registration approved'
        : 'Registration rejected',
    );
  };
  return (
    <>
      <Link href="/admin/registrations" className="text-link text-sm">
        ← All registrations
      </Link>
      <PageHeading
        title={r.name}
        description={`Review ${r.role} registration and the submitted profile information.`}
      />
      <Card>
        <div className="card-heading">
          <h2>Submitted information</h2>
          <Badge value={r.status} />
        </div>
        <DetailGrid
          values={{
            Name: r.name,
            Email: r.email,
            Role: title(r.role),
            Submitted: dateTime(r.createdAt),
            ...Object.fromEntries(
              Object.entries(r.profile).map(([key, value]) => [
                title(key.replace(/([A-Z])/g, ' $1')),
                value,
              ]),
            ),
            ...(r.rejectionReason
              ? { 'Rejection reason': r.rejectionReason }
              : {}),
          }}
        />
      </Card>
      {r.status === 'pending' ? (
        <>
          <Card>
            <h2 className="mb-5">Approve registration</h2>
            <fieldset className="mb-5 space-y-3">
              <legend className="mb-3 text-sm font-medium">
                Profile approval method
              </legend>
              {(['create', 'link'] as const).map((v) => (
                <label key={v} className="flex items-center gap-3 text-sm">
                  <input
                    type="radio"
                    name="approvalMode"
                    checked={mode === v}
                    onChange={() => {
                      setMode(v);
                      setActionError(undefined);
                    }}
                    className="accent-teal-700"
                  />
                  {v === 'create'
                    ? 'Create a profile from submitted details'
                    : 'Link a matching existing profile'}
                </label>
              ))}
            </fieldset>
            {mode === 'link' ? (
              <>
                <p className="mb-4 text-sm leading-6 text-slate-500">
                  Select an unclaimed {r.role} profile with the exact email{' '}
                  <strong>{r.email}</strong>. The backend verifies email and
                  account ownership before linking. Existing profile details are
                  preserved.
                </p>
                <RecordPicker
                  kind={r.role === 'doctor' ? 'doctors' : 'patients'}
                  onSelect={(record) => {
                    if (record.email?.toLowerCase() !== r.email.toLowerCase()) {
                      setActionError(
                        new Error(
                          'Select a profile with the exact same email as this registration.',
                        ),
                      );
                      return;
                    }
                    setSelected(record);
                    setActionError(undefined);
                  }}
                />
                {selected && (
                  <div className="my-5 rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <p className="text-sm font-semibold">
                      Selected: {selected.name}
                    </p>
                    <p className="text-xs text-slate-600">{selected.email}</p>
                  </div>
                )}
                {!!actionError && (
                  <ErrorState
                    error={actionError}
                    retry={() => {
                      setActionError(undefined);
                      void result.refetch();
                    }}
                  />
                )}
                <Button
                  className="mt-5"
                  disabled={!selected || busy}
                  onClick={async () => {
                    if (!selected) return;
                    setBusy(true);
                    try {
                      await decision({
                        decision: 'approve',
                        mode: 'link',
                        profileId: selected.id,
                      });
                    } catch (err) {
                      setActionError(err);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? 'Approving…' : 'Approve and link profile'}
                </Button>
              </>
            ) : (
              <RecordForm
                fields={r.role === 'patient' ? clinicalFields : []}
                submitLabel="Approve and create profile"
                onReload={() => void result.refetch()}
                onSave={async (values) => {
                  await decision(
                    r.role === 'patient'
                      ? {
                          decision: 'approve',
                          mode: 'create',
                          patientClinical: {
                            condition: values.condition,
                            status: values.status as Patient['status'],
                          },
                        }
                      : { decision: 'approve', mode: 'create' },
                  );
                }}
              />
            )}
          </Card>
          <Card>
            <h2 className="mb-2">Reject registration</h2>
            <p className="mb-5 text-sm text-slate-500">
              The submission will be preserved. Decisions are final in this
              version.
            </p>
            <RecordForm
              fields={[
                {
                  name: 'reason',
                  label: 'Rejection reason (optional)',
                  type: 'textarea',
                  max: 1000,
                },
              ]}
              submitLabel="Reject registration"
              onReload={() => void result.refetch()}
              onSave={async (values) => {
                await decision({
                  decision: 'reject',
                  ...(values.reason ? { reason: values.reason } : {}),
                });
              }}
            />
          </Card>
        </>
      ) : (
        <Card>
          <p className="text-sm text-slate-600">
            This registration has already been reviewed. Decisions are final in
            this version.
          </p>
        </Card>
      )}
    </>
  );
}

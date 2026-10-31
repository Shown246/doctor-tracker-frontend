'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, api, body, queryKeys } from '@/lib/api/client';
import type { Note, Patient } from '@/lib/api/types';
import { dateTime, title } from '@/lib/utils';
import { useAccount } from './account-context';
import { RecordForm, clinicalFields } from './forms';
import {
  Badge,
  Card,
  Confirm,
  DetailGrid,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
} from './shared';
import { Pagination, useListState } from './lists';
import {
  LinkedDoctors,
  PatientEditor,
  recordValues,
  useRefresh,
} from './management';
import { Button } from './ui/button';

export function ClinicalEditor({ patient }: { patient: Patient }) {
  const refresh = useRefresh();
  const [snapshot, setSnapshot] = useState(patient);
  const [version, setVersion] = useState(0);
  return (
    <Card>
      <h2 className="mb-5">Shared clinical information</h2>
      <p className="mb-5 text-xs text-slate-500">
        Condition and status are shared with the care team and the patient.
      </p>
      <RecordForm
        key={version}
        fields={clinicalFields}
        defaults={recordValues(snapshot)}
        onReload={async () => {
          const latest = body(
            await api.GET('/me/patients/{patientId}', {
              params: { path: { patientId: patient.id } },
            }),
          ).data;
          setSnapshot(latest);
          setVersion((v) => v + 1);
        }}
        onSave={async (values) => {
          const saved = body(
            await api.PATCH('/me/patients/{patientId}/clinical', {
              params: { path: { patientId: patient.id } },
              body: {
                condition: values.condition,
                status: values.status as Patient['status'],
                revision: snapshot.revision,
              },
            }),
          ).data;
          setSnapshot(saved);
          setVersion((v) => v + 1);
          await refresh(['patients', 'dashboard']);
          toast.success('Clinical information updated');
        }}
      />
    </Card>
  );
}
function NoteForm({ patientId, note }: { patientId: string; note: Note }) {
  const refresh = useRefresh();
  const [snapshot, setSnapshot] = useState(note);
  const [version, setVersion] = useState(0);
  const [reloadError, setReloadError] = useState<unknown>();
  const reload = async () => {
    try {
      const next = body(
        await api.GET('/me/patients/{patientId}/note', {
          params: { path: { patientId } },
        }),
      ).data;
      setSnapshot(next);
      setVersion((v) => v + 1);
      setReloadError(undefined);
    } catch (err) {
      setReloadError(err);
    }
  };
  return (
    <>
      <p className="mb-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
        <LockKeyhole size={16} className="shrink-0" />
        Private to you and administrators. Other doctors and the patient cannot
        read this note.
      </p>
      <RecordForm
        key={version}
        fields={[
          {
            name: 'note',
            label: 'Your private note',
            type: 'textarea',
            required: true,
            max: 20000,
          },
        ]}
        defaults={{ note: snapshot.note ?? '' }}
        submitLabel="Save note"
        onReload={() => void reload()}
        onSave={async (values) => {
          const saved = body(
            await api.PUT('/me/patients/{patientId}/note', {
              params: { path: { patientId } },
              body: { note: values.note, revision: snapshot.revision },
            }),
          ).data;
          setSnapshot(saved);
          setVersion((v) => v + 1);
          await refresh(['notes']);
          toast.success('Private note saved');
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {snapshot.note && (
          <Confirm
            label="Clear note"
            title="Clear private note"
            description="Permanently clear your private note? This action cannot be undone."
            onConfirm={async () => {
              await api.DELETE('/me/patients/{patientId}/note', {
                params: { path: { patientId } },
                body: { revision: snapshot.revision },
              });
              await reload();
              await refresh(['notes']);
              toast.success('Private note cleared');
            }}
          />
        )}
        <Button variant="ghost" onClick={() => void reload()}>
          Load latest note
        </Button>
      </div>
      {!!reloadError && (
        <ErrorState error={reloadError} retry={() => void reload()} />
      )}
      <p className="mt-4 text-xs text-slate-500">
        Last saved: {dateTime(snapshot.updatedAt)}
      </p>
    </>
  );
}
export function PrivateNote({ patientId }: { patientId: string }) {
  const account = useAccount();
  const result = useQuery({
    queryKey: [...queryKeys.resource(account.id, 'notes'), patientId],
    gcTime: 0,
    staleTime: 0,
    queryFn: async ({ signal }) =>
      body(
        await api.GET('/me/patients/{patientId}/note', {
          params: { path: { patientId } },
          signal,
        }),
      ).data,
  });
  return (
    <Card>
      <h2 className="mb-5">Your private note</h2>
      {result.isPending ? (
        <Loading />
      ) : result.isError ? (
        <ErrorState error={result.error} retry={() => void result.refetch()} />
      ) : (
        <NoteForm patientId={patientId} note={result.data} />
      )}
    </Card>
  );
}
function AdminNotes({ patientId }: { patientId: string }) {
  const account = useAccount();
  const { query, change } = useListState(['notesPage']);
  const page = query.notesPage ?? '1';
  const result = useQuery({
    queryKey: [...queryKeys.resource(account.id, 'notes'), patientId, page],
    queryFn: async ({ signal }) =>
      body(
        await api.GET('/patients/{patientId}/doctor-notes', {
          params: { path: { patientId }, query: { page, limit: '10' } },
          signal,
        }),
      ),
  });
  return (
    <Card>
      <h2>Doctor notes</h2>
      <p className="mb-5 mt-2 text-xs text-slate-500">
        Read-only private notes, attributed to their author.
      </p>
      {result.isPending ? (
        <Loading />
      ) : result.isError ? (
        <ErrorState error={result.error} retry={() => void result.refetch()} />
      ) : (
        <>
          {!result.data.data.length ? (
            <Empty message="No doctor notes have been recorded." />
          ) : (
            <div className="space-y-4">
              {result.data.data.map((n) => (
                <article
                  className="rounded-lg border border-slate-200 p-4"
                  key={n.doctor.id}
                >
                  <div className="mb-3 flex flex-wrap justify-between gap-3">
                    <Link
                      href={`/admin/doctors/${n.doctor.id}`}
                      className="text-link text-sm"
                    >
                      {n.doctor.name}
                    </Link>
                    <span className="text-xs text-slate-400">
                      {dateTime(n.updatedAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                    {n.note}
                  </p>
                </article>
              ))}
            </div>
          )}
          <Pagination
            meta={result.data.meta}
            onChange={(p) => change('notesPage', String(p))}
          />
        </>
      )}
    </Card>
  );
}
export function PatientDetailView({ id }: { id: string }) {
  const account = useAccount();
  const client = useQueryClient();
  const router = useRouter();
  const refresh = useRefresh();
  const [editing, setEditing] = useState(false);
  const { query, change } = useListState(['linksPage']);
  const page = query.linksPage ?? '1';
  const result = useQuery({
    queryKey: [...queryKeys.resource(account.id, 'patients'), id, page],
    queryFn: async ({ signal }) =>
      account.role === 'admin'
        ? body(
            await api.GET('/patients/{id}', {
              params: { path: { id }, query: { page, limit: '10' } },
              signal,
            }),
          ).data
        : body(
            await api.GET('/me/patients/{patientId}', {
              params: { path: { patientId: id }, query: { page, limit: '10' } },
              signal,
            }),
          ).data,
    refetchInterval: 30_000,
    staleTime: 0,
  });
  useEffect(() => {
    if (result.error instanceof ApiError && result.error.status === 404) {
      const queryKey = [...queryKeys.resource(account.id, 'notes'), id];
      void client
        .cancelQueries({ queryKey })
        .then(() => client.removeQueries({ queryKey }));
    }
  }, [account.id, client, id, result.error]);
  if (result.isPending) return <Loading />;
  if (result.isError)
    return (
      <ErrorState error={result.error} retry={() => void result.refetch()} />
    );
  const p = result.data;
  const admin = account.role === 'admin';
  return (
    <>
      <Link
        href={`/${account.role}/patients`}
        className="text-link inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft size={14} />
        All patients
      </Link>
      <PageHeading
        title={p.name}
        description={`${p.age} years · ${title(p.gender)} · Patient record`}
        action={
          <div className="flex flex-wrap gap-3">
            {admin && (
              <Button variant="outline" onClick={() => setEditing(!editing)}>
                {editing ? 'Close editor' : 'Edit patient'}
              </Button>
            )}
            <Button
              variant="outline"
              disabled={result.isFetching}
              onClick={() => void result.refetch()}
            >
              Refresh record
            </Button>
          </div>
        }
      />
      <Card>
        <div className="card-heading">
          <h2>Patient information</h2>
          <Badge value={p.status} />
        </div>
        <DetailGrid
          values={{
            Email: p.email,
            Phone: p.phone,
            'Date of birth': p.dateOfBirth,
            Address: p.address,
            Condition: p.condition || 'Not recorded',
            'Last clinical update': dateTime(p.lastClinicalUpdateAt),
          }}
        />
        {admin && editing && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="mb-4 text-xs text-slate-500">
              An email linked to a login account cannot be changed. Clinical
              changes use the revision you last reviewed.
            </p>
            <PatientEditor patient={p} onDone={() => setEditing(false)} />
          </div>
        )}
      </Card>
      {!admin && <ClinicalEditor patient={p} />}
      <LinkedDoctors
        patientId={id}
        doctors={p.linkedDoctors}
        meta={p.linkedDoctorsMeta}
        onPage={(n) => change('linksPage', String(n))}
        canManage={admin}
      />
      {admin ? <AdminNotes patientId={id} /> : <PrivateNote patientId={id} />}
      {admin && (
        <Card>
          <h2 className="text-red-800">Permanently delete patient</h2>
          <p className="mb-5 mt-2 text-sm text-slate-500">
            Remove this patient and their associated records.
          </p>
          <Confirm
            label="Delete patient"
            title="Permanently delete patient"
            description={`Permanently delete ${p.name}? All doctor links and private notes will be removed, and the patient's linked account will lose portal access. This cannot be undone.`}
            onConfirm={async () => {
              await api.DELETE('/patients/{id}', { params: { path: { id } } });
              await refresh(['patients', 'doctors', 'notes', 'dashboard']);
              toast.success('Patient permanently deleted');
              router.push('/admin/patients');
            }}
          />
        </Card>
      )}
    </>
  );
}

'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, Stethoscope, X } from 'lucide-react';
import { toast } from 'sonner';
import { api, body, queryKeys } from '@/lib/api/client';
import type { Doctor, Patient, Schema } from '@/lib/api/types';
import { dateTime } from '@/lib/utils';
import { useAccount } from './account-context';
import {
  RecordForm,
  doctorFields,
  patientFields,
  clinicalFields,
  type Values,
} from './forms';
import {
  Card,
  Confirm,
  DetailGrid,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
} from './shared';
import {
  ListControls,
  Pagination,
  PatientTable,
  RecordPicker,
  useListState,
} from './lists';
import { Button } from './ui/button';
import { Modal } from './ui/dialog';

export function useRefresh() {
  const account = useAccount();
  const client = useQueryClient();
  return async (resources: string[]) => {
    const affected = [
      ...new Set([
        ...resources,
        ...(resources.some((r) => r === 'doctors' || r === 'patients')
          ? ['filters']
          : []),
      ]),
    ];
    await Promise.all(
      affected.map((resource) =>
        client.invalidateQueries({
          queryKey: queryKeys.resource(account.id, resource),
        }),
      ),
    );
  };
}
export function recordValues(record: Doctor | Patient): Values {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => typeof value === 'string'),
  ) as Values;
}
function patientInput(
  values: Values,
): Omit<Schema['PatientPatch'], 'revision'> {
  return {
    name: values.name,
    email: values.email || null,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender as Patient['gender'],
    phone: values.phone,
    address: values.address || null,
    condition: values.condition ?? '',
    status: values.status as Patient['status'],
  };
}
function doctorInput(values: Values): Schema['DoctorCreate'] {
  return {
    name: values.name,
    email: values.email,
    specialization: values.specialization,
    hospital: values.hospital,
    phone: values.phone,
  };
}
const patientListKeys = [
  'page',
  'limit',
  'search',
  'sort',
  'from',
  'to',
  'condition',
  'status',
  'doctorId',
];
const doctorListKeys = [
  'page',
  'limit',
  'search',
  'sort',
  'from',
  'to',
  'specialization',
  'hospital',
];

export function PatientList({ doctorId }: { doctorId?: string }) {
  const account = useAccount();
  const [linkingPatient, setLinkingPatient] = useState<Patient>();
  const { query, change } = useListState(patientListKeys);
  const result = useQuery({
    queryKey: [
      ...queryKeys.resource(account.id, 'patients'),
      doctorId ?? 'list',
      query,
    ],
    queryFn: async ({ signal }) =>
      account.role === 'doctor'
        ? body(await api.GET('/me/patients', { params: { query }, signal }))
        : doctorId
          ? body(
              await api.GET('/doctors/{doctorId}/patients', {
                params: { path: { doctorId }, query },
                signal,
              }),
            )
          : body(await api.GET('/patients', { params: { query }, signal })),
  });
  useEffect(() => {
    if (
      result.data &&
      !result.data.data.length &&
      result.data.meta.page > Math.max(1, result.data.meta.totalPages)
    )
      change('page', String(Math.max(1, result.data.meta.totalPages)));
  }, [result.data, change]);
  const refresh = useRefresh();
  return (
    <Card>
      {linkingPatient && (
        <LinkPatientDialog
          initialPatient={linkingPatient}
          onClose={() => setLinkingPatient(undefined)}
        />
      )}
      <ListControls
        kind="patients"
        doctorFilter={account.role === 'admin' && !doctorId}
      />
      {result.isPending ? (
        <Loading />
      ) : result.isError ? (
        <ErrorState error={result.error} retry={() => void result.refetch()} />
      ) : (
        <>
          <PatientTable
            records={result.data.data}
            base={
              account.role === 'admin' ? '/admin/patients' : '/doctor/patients'
            }
            action={
              doctorId
                ? (patient) => (
                    <Confirm
                      label="Unlink"
                      title="Unlink patient"
                      description={`Unlink ${patient.name}? This doctor's private note will be permanently deleted. The patient record and other doctors remain.`}
                      onConfirm={async () => {
                        await api.DELETE(
                          '/doctors/{doctorId}/patients/{patientId}',
                          {
                            params: {
                              path: { doctorId, patientId: patient.id },
                            },
                          },
                        );
                        await refresh([
                          'doctors',
                          'patients',
                          'notes',
                          'dashboard',
                        ]);
                        toast.success('Patient unlinked');
                      }}
                    />
                  )
                : account.role === 'admin'
                  ? (patient) => (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLinkingPatient(patient)}
                      >
                        Link doctors
                      </Button>
                    )
                  : undefined
            }
          />
          <Pagination
            meta={result.data.meta}
            onChange={(page) => change('page', String(page))}
          />
        </>
      )}
    </Card>
  );
}
export function PatientsPage() {
  const account = useAccount();
  const [linking, setLinking] = useState(false);
  return (
    <>
      <PageHeading
        title={account.role === 'admin' ? 'Patients' : 'My patients'}
        description={
          account.role === 'admin'
            ? 'Search registered patients by phone or email and link them to one or more doctors.'
            : 'Review and update care for your currently assigned patients.'
        }
        action={
          account.role === 'admin' && (
            <Button onClick={() => setLinking(true)}>
              <Stethoscope /> Link patient
            </Button>
          )
        }
      />
      <PatientList />
      {linking && <LinkPatientDialog onClose={() => setLinking(false)} />}
    </>
  );
}
export function DoctorsPage() {
  const account = useAccount();
  const { query, change } = useListState(doctorListKeys);
  const result = useQuery({
    queryKey: [...queryKeys.resource(account.id, 'doctors'), query],
    queryFn: async ({ signal }) =>
      body(await api.GET('/doctors', { params: { query }, signal })),
  });
  return (
    <>
      <PageHeading
        title="Doctors"
        description="Your care network, organized. View profiles, patient assignments and specialties."
        action={
          <Button asChild>
            <Link href="/admin/doctors/new">
              <Plus />
              Add doctor
            </Link>
          </Button>
        }
      />
      <Card>
        <ListControls kind="doctors" />
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
              <Empty />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Hospital</th>
                      <th>Patients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.data.map((doctor) => (
                      <tr key={doctor.id}>
                        <td>
                          <Link
                            className="record-link"
                            href={`/admin/doctors/${doctor.id}`}
                          >
                            {doctor.name}
                          </Link>
                          <span className="mt-1 block text-xs text-slate-500">
                            {doctor.email}
                          </span>
                        </td>
                        <td>{doctor.specialization}</td>
                        <td>{doctor.hospital}</td>
                        <td>
                          <span className="rounded-md bg-teal-50 px-2 py-1 font-semibold text-teal-800">
                            {doctor.patientCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              meta={result.data.meta}
              onChange={(page) => change('page', String(page))}
            />
          </>
        )}
      </Card>
    </>
  );
}
export function NewDoctor() {
  const router = useRouter();
  const refresh = useRefresh();
  return (
    <>
      <PageHeading
        title="Add doctor"
        description="Create a doctor profile. A login account is linked through registration approval."
      />
      <Card>
        <RecordForm
          fields={doctorFields}
          submitLabel="Create doctor"
          onSave={async (values) => {
            const doctor = body(
              await api.POST('/doctors', { body: doctorInput(values) }),
            ).data;
            await refresh(['doctors', 'dashboard']);
            toast.success('Doctor created');
            router.push(`/admin/doctors/${doctor.id}`);
          }}
        />
      </Card>
    </>
  );
}
export function LinkPatientDialog({
  initialPatient,
  onClose,
}: {
  initialPatient?: Patient;
  onClose: () => void;
}) {
  const [patient, setPatient] = useState(initialPatient);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const refresh = useRefresh();
  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
      title="Link patient to doctors"
      description="Search for a registered patient by phone number or email, then select one or more doctors."
    >
      {!!error && <ErrorState error={error} />}
      {!patient ? (
        <RecordPicker
          kind="patients"
          onSelect={(record) => setPatient(record as Patient)}
        />
      ) : (
        <div className="space-y-4" aria-busy={busy}>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-semibold">{patient.name}</p>
            <p className="break-all text-sm text-slate-600">
              {patient.phone}
              {patient.email && ` / ${patient.email}`}
            </p>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setPatient(undefined);
                setDoctors([]);
                setError(undefined);
              }}
            >
              Choose another patient
            </Button>
          </div>
          <p className="text-sm text-slate-600">
            Select doctors to link. Existing doctor links will be kept.
          </p>
          <div className="flex flex-wrap gap-2">
            {doctors.map((doctor) => (
              <Button
                key={doctor.id}
                variant="outline"
                disabled={busy}
                aria-label={`Remove ${doctor.name}`}
                onClick={() =>
                  setDoctors((current) =>
                    current.filter((d) => d.id !== doctor.id),
                  )
                }
              >
                {doctor.name}
                <X size={14} />
              </Button>
            ))}
          </div>
          {!busy && (
            <RecordPicker
              kind="doctors"
              selected={doctors.map((d) => d.id)}
              onSelect={(doctor) =>
                setDoctors((current) =>
                  current.some((d) => d.id === doctor.id)
                    ? current
                    : [...current, { id: doctor.id, name: doctor.name }],
                )
              }
            />
          )}
          <Button
            disabled={busy || !doctors.length}
            onClick={async () => {
              setBusy(true);
              setError(undefined);
              try {
                for (const doctor of doctors) {
                  await api.PUT('/doctors/{doctorId}/patients/{patientId}', {
                    params: {
                      path: { doctorId: doctor.id, patientId: patient.id },
                    },
                  });
                  setDoctors((current) =>
                    current.filter((d) => d.id !== doctor.id),
                  );
                }
                toast.success('Patient linked to selected doctors');
                onClose();
              } catch (err) {
                setError(err);
              } finally {
                setBusy(false);
                await refresh(['doctors', 'patients', 'dashboard']);
              }
            }}
          >
            {busy
              ? 'Linking doctors...'
              : `Link selected doctors (${doctors.length})`}
          </Button>
        </div>
      )}
    </Modal>
  );
}
export function DoctorDetailView({ id }: { id: string }) {
  const account = useAccount();
  const refresh = useRefresh();
  const [editing, setEditing] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const result = useQuery({
    queryKey: [...queryKeys.resource(account.id, 'doctors'), id],
    queryFn: async ({ signal }) =>
      body(await api.GET('/doctors/{id}', { params: { path: { id } }, signal }))
        .data,
    refetchOnWindowFocus: false,
  });
  if (result.isPending) return <Loading />;
  if (result.isError)
    return (
      <ErrorState error={result.error} retry={() => void result.refetch()} />
    );
  const d = result.data;
  return (
    <>
      <Link
        href="/admin/doctors"
        className="text-link inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft size={14} />
        All doctors
      </Link>
      <PageHeading
        title={d.name}
        description={`${d.specialization} · ${d.hospital}`}
        action={
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? 'Close editor' : 'Edit doctor'}
          </Button>
        }
      />
      <Card>
        <DetailGrid
          values={{
            Email: d.email,
            Phone: d.phone,
            Specialization: d.specialization,
            Hospital: d.hospital,
            Created: dateTime(d.createdAt),
          }}
        />
        {editing && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="mb-4 text-xs text-slate-500">
              An email linked to a login account cannot be changed.
            </p>
            <RecordForm
              fields={doctorFields}
              defaults={recordValues(d)}
              onSave={async (values) => {
                await api.PATCH('/doctors/{id}', {
                  params: { path: { id } },
                  body: doctorInput(values),
                });
                await refresh(['doctors']);
                setEditing(false);
                toast.success('Doctor updated');
              }}
            />
          </div>
        )}
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2>Assigned patients</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setLinkError(undefined);
              setLinking(true);
            }}
          >
            Link existing patient
          </Button>
        </div>
      </div>
      <PatientList doctorId={id} />
      <Modal
        open={linking}
        onOpenChange={(v) => {
          if (!busy) setLinking(v);
        }}
        title="Link existing patient"
        description="Find a patient to add to this doctor's care team."
      >
        {!!linkError && <ErrorState error={linkError} />}
        {busy ? (
          <Loading />
        ) : (
          <RecordPicker
            kind="patients"
            onSelect={async (patient) => {
              setBusy(true);
              try {
                await api.PUT('/doctors/{doctorId}/patients/{patientId}', {
                  params: { path: { doctorId: id, patientId: patient.id } },
                });
                await refresh(['doctors', 'patients', 'dashboard']);
                setLinking(false);
                toast.success('Patient linked');
              } catch (err) {
                setLinkError(err);
              } finally {
                setBusy(false);
              }
            }}
          />
        )}
      </Modal>
    </>
  );
}
export function PatientEditor({
  patient,
  onDone,
}: {
  patient: Patient;
  onDone: () => void;
}) {
  const refresh = useRefresh();
  const [version, setVersion] = useState(0);
  const [current, setCurrent] = useState(patient);
  return (
    <RecordForm
      key={version}
      fields={[...patientFields, ...clinicalFields]}
      defaults={recordValues(current)}
      onReload={async () => {
        const data = body(
          await api.GET('/patients/{id}', {
            params: { path: { id: patient.id } },
          }),
        ).data;
        setCurrent(data);
        setVersion(version + 1);
      }}
      onSave={async (values) => {
        const input = patientInput(values);
        await api.PATCH('/patients/{id}', {
          params: { path: { id: patient.id } },
          body: { ...input, revision: current.revision },
        });
        await refresh(['patients', 'dashboard']);
        toast.success('Patient updated');
        onDone();
      }}
    />
  );
}
export function LinkedDoctors({
  patientId,
  doctors,
  meta,
  onPage,
  canManage,
}: {
  patientId: string;
  doctors: Doctor[];
  meta: Schema['PatientDetailResponse']['data']['linkedDoctorsMeta'];
  onPage: (page: number) => void;
  canManage: boolean;
}) {
  const refresh = useRefresh();
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  return (
    <Card>
      <div className="card-heading">
        <h2>
          Linked doctors{' '}
          <span className="ml-2 text-sm font-normal text-slate-400">
            {meta.total}
          </span>
        </h2>
        {canManage && (
          <Button
            variant="outline"
            onClick={() => {
              setLinking(true);
              setError(undefined);
            }}
          >
            Link doctor
          </Button>
        )}
      </div>
      {!doctors.length ? (
        <Empty message="No doctors are linked to this patient." />
      ) : (
        <div className="space-y-4">
          {doctors.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-center gap-3">
                <Stethoscope className="size-5 text-teal-700" />
                <div>
                  {canManage ? (
                    <Link
                      href={`/admin/doctors/${d.id}`}
                      className="record-link"
                    >
                      {d.name}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold">{d.name}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {d.specialization} · {d.hospital}
                  </p>
                </div>
              </div>
              {canManage && (
                <Confirm
                  label="Unlink"
                  title="Unlink doctor"
                  description={`Unlink ${d.name}? This doctor's private note will be permanently deleted. The patient record and other doctors remain.`}
                  onConfirm={async () => {
                    await api.DELETE(
                      '/doctors/{doctorId}/patients/{patientId}',
                      { params: { path: { doctorId: d.id, patientId } } },
                    );
                    await refresh([
                      'patients',
                      'doctors',
                      'notes',
                      'dashboard',
                    ]);
                    toast.success('Doctor unlinked');
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination meta={meta} onChange={onPage} />
      <Modal
        open={linking}
        onOpenChange={(v) => {
          if (!busy) setLinking(v);
        }}
        title="Link a doctor"
        description="Find a doctor to connect with this patient."
      >
        {!!error && <ErrorState error={error} />}
        {busy ? (
          <Loading />
        ) : (
          <RecordPicker
            kind="doctors"
            selected={doctors.map((d) => d.id)}
            onSelect={async (d) => {
              setBusy(true);
              try {
                await api.PUT('/doctors/{doctorId}/patients/{patientId}', {
                  params: { path: { doctorId: d.id, patientId } },
                });
                await refresh(['patients', 'doctors', 'dashboard']);
                setLinking(false);
                toast.success('Doctor linked');
              } catch (err) {
                setError(err);
              } finally {
                setBusy(false);
              }
            }}
          />
        )}
      </Modal>
    </Card>
  );
}

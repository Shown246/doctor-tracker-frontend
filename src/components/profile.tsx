'use client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, body, queryKeys } from '@/lib/api/client';
import { title, dateTime } from '@/lib/utils';
import { useAccount } from './account-context';
import { RecordForm } from './forms';
import { recordValues, useRefresh } from './management';
import {
  Badge,
  Card,
  DetailGrid,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
} from './shared';
import { Pagination, useListState } from './lists';
import { Stethoscope } from 'lucide-react';

export function ProfileView() {
  const account = useAccount();
  const refresh = useRefresh();
  const result = useQuery({
    queryKey: queryKeys.resource(account.id, 'profile'),
    queryFn: async ({ signal }) =>
      body(await api.GET('/me/profile', { signal })).data,
  });
  if (result.isPending) return <Loading />;
  if (result.isError)
    return (
      <ErrorState error={result.error} retry={() => void result.refetch()} />
    );
  const p = result.data;
  return (
    <>
      <PageHeading
        title="My profile"
        description={
          account.role === 'patient'
            ? 'Your personal information and contact details. Your care team manages clinical information.'
            : 'Your professional details. Contact your administrator to request a change.'
        }
      />
      <Card>
        <h2>{p.name}</h2>
        <DetailGrid
          values={{
            Email: p.email,
            Phone: p.phone,
            ...('specialization' in p
              ? { Specialization: p.specialization, Hospital: p.hospital }
              : {
                  'Date of birth': p.dateOfBirth,
                  Age: p.age,
                  Gender: title(p.gender),
                  Address: p.address,
                  Condition: p.condition || 'Not recorded',
                  Status: <Badge value={p.status} />,
                  'Last clinical update': dateTime(p.lastClinicalUpdateAt),
                }),
          }}
        />
      </Card>
      {account.role === 'patient' && 'dateOfBirth' in p && (
        <Card>
          <h2 className="mb-5">Edit contact details</h2>
          <RecordForm
            fields={[
              {
                name: 'phone',
                label: 'Phone',
                type: 'tel',
                required: true,
                max: 32,
              },
              { name: 'address', label: 'Address', type: 'textarea', max: 500 },
            ]}
            defaults={recordValues(p)}
            onSave={async (values) => {
              await api.PATCH('/me/profile', {
                body: { phone: values.phone, address: values.address || null },
              });
              await refresh(['profile']);
              toast.success('Contact details updated');
            }}
          />
        </Card>
      )}
    </>
  );
}
export function MyDoctors() {
  const account = useAccount();
  const { query, change } = useListState(['page', 'limit']);
  const result = useQuery({
    queryKey: [...queryKeys.resource(account.id, 'doctors'), query],
    queryFn: async ({ signal }) =>
      body(await api.GET('/me/doctors', { params: { query }, signal })),
  });
  return (
    <>
      <PageHeading
        title="My doctors"
        description="Meet the doctors linked to your care. Your administrator manages these connections."
      />
      <Card>
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
              <Empty message="No doctors are linked yet. Contact your administrator to get connected." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {result.data.data.map((d) => (
                  <article
                    key={d.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <Stethoscope className="mb-4 size-6 text-teal-700" />
                    <h2>{d.name}</h2>
                    <DetailGrid
                      values={{
                        Specialization: d.specialization,
                        Hospital: d.hospital,
                        Phone: d.phone,
                        Email: d.email,
                      }}
                    />
                  </article>
                ))}
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

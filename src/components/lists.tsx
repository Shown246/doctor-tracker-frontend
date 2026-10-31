'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { api, body, queryKeys } from '@/lib/api/client';
import type { Meta, Patient, Doctor } from '@/lib/api/types';
import { title } from '@/lib/utils';
import { listQuery, updateListState } from '@/lib/list-state';
import { useAccount } from './account-context';
import { Badge, Empty, ErrorState, Loading } from './shared';
import { Button } from './ui/button';

export function useListState(keys?: readonly string[]) {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = listQuery(new URLSearchParams(search.toString()), keys);
  return {
    query,
    search,
    clear: () => router.replace(pathname, { scroll: false }),
    change: (key: string, value: string) => {
      const next = updateListState(search.toString(), key, value);
      router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
    },
  };
}
export function DebouncedSearch({
  value,
  onChange,
  label = 'Search records',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [draft, setDraft] = useState(value);
  // A keyed instance below synchronizes browser back/forward without stale timers.
  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onChange(draft.trim()), 350);
    return () => clearTimeout(timer);
  }, [draft, value, onChange]);
  return (
    <label className="search-input">
      <Search size={17} />
      <input
        aria-label={label}
        placeholder="Search by name, email, phone…"
        maxLength={200}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
    </label>
  );
}
export function Pagination({
  meta,
  onChange,
}: {
  meta: Meta;
  onChange: (page: number) => void;
}) {
  return (
    <nav className="pagination" aria-label="Pagination">
      <p>
        {meta.total.toLocaleString()} records{' '}
        <span className="mx-2 text-slate-300">·</span> Page {meta.page} of{' '}
        {Math.max(1, meta.totalPages)}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Previous page"
          disabled={meta.page <= 1}
          onClick={() => onChange(meta.page - 1)}
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Next page"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onChange(meta.page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
export function ScopedFilter({
  field,
  value,
  onChange,
}: {
  field: 'condition' | 'status' | 'specialization' | 'hospital';
  value: string;
  onChange: (value: string) => void;
}) {
  const account = useAccount();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const options = useQuery({
    queryKey: [
      ...queryKeys.resource(account.id, 'filters'),
      field,
      search,
      page,
    ],
    queryFn: async ({ signal }) =>
      body(
        await api.GET('/filters', {
          params: {
            query: {
              field,
              search: search || undefined,
              page: String(page),
              limit: '20',
            },
          },
          signal,
        }),
      ),
  });
  return (
    <details className="filter-menu">
      <summary>
        {title(field)}
        {value ? `: ${title(value)}` : ''}
      </summary>
      <div className="filter-panel">
        <label className="field">
          <span>Find {field}</span>
          <input
            className="input"
            value={search}
            maxLength={200}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <Button variant="ghost" size="sm" onClick={() => onChange('')}>
          All {field} values
        </Button>
        {options.isPending ? (
          <p role="status">Loading options…</p>
        ) : options.isError ? (
          <ErrorState
            error={options.error}
            retry={() => void options.refetch()}
          />
        ) : (
          <>
            <div className="max-h-48 overflow-auto">
              {options.data.data.map((option) => (
                <button
                  type="button"
                  className="option"
                  aria-pressed={value === option.value}
                  key={option.value}
                  onClick={() => onChange(option.value)}
                >
                  {title(option.label)}
                </button>
              ))}
              {!options.data.data.length && (
                <p className="p-3 text-sm">No matching values</p>
              )}
            </div>
            <div className="mt-2 flex justify-between">
              <Button
                size="sm"
                variant="ghost"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous options
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={page >= options.data.meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                More options
              </Button>
            </div>
          </>
        )}
      </div>
    </details>
  );
}
export function ListControls({
  kind,
  registration = false,
  doctorFilter = false,
}: {
  kind: 'doctors' | 'patients';
  registration?: boolean;
  doctorFilter?: boolean;
}) {
  const { query, change, search, clear } = useListState();
  return (
    <div className="space-y-4">
      {!registration && (
        <div className="flex flex-wrap gap-3">
          <DebouncedSearch
            key={search.get('search') ?? ''}
            value={query.search ?? ''}
            onChange={(v) => change('search', v)}
          />
          <label className="sr-only" htmlFor="sort">
            Sort records
          </label>
          <select
            id="sort"
            className="input w-auto"
            value={query.sort ?? '-createdAt'}
            onChange={(e) => change('sort', e.target.value)}
          >
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="-name">Name Z–A</option>
          </select>
        </div>
      )}
      <div className="flex flex-wrap items-end gap-3">
        {registration ? (
          <>
            <label className="field">
              <span>Role</span>
              <select
                className="input"
                value={query.role ?? ''}
                onChange={(e) => change('role', e.target.value)}
              >
                <option value="">All roles</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
            </label>
            <label className="field">
              <span>Account status</span>
              <select
                className="input"
                value={query.status ?? ''}
                onChange={(e) => change('status', e.target.value)}
              >
                <option value="">All statuses</option>
                {['pending', 'active', 'rejected', 'disabled'].map((v) => (
                  <option key={v} value={v}>
                    {title(v)}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <ScopedFilter
              field={kind === 'doctors' ? 'specialization' : 'condition'}
              value={
                query[kind === 'doctors' ? 'specialization' : 'condition'] ?? ''
              }
              onChange={(v) =>
                change(kind === 'doctors' ? 'specialization' : 'condition', v)
              }
            />
            <ScopedFilter
              field={kind === 'doctors' ? 'hospital' : 'status'}
              value={query[kind === 'doctors' ? 'hospital' : 'status'] ?? ''}
              onChange={(v) =>
                change(kind === 'doctors' ? 'hospital' : 'status', v)
              }
            />
            {doctorFilter && (
              <details className="filter-menu">
                <summary>
                  Assigned doctor{query.doctorId ? ' (selected)' : ''}
                </summary>
                <div className="filter-panel">
                  <Button
                    variant="ghost"
                    onClick={() => change('doctorId', '')}
                  >
                    All doctors
                  </Button>
                  <RecordPicker
                    kind="doctors"
                    onSelect={(record) => change('doctorId', record.id)}
                  />
                </div>
              </details>
            )}
            {['from', 'to'].map((field) => (
              <label key={field} className="field">
                <span>Created {field} (Dhaka)</span>
                <input
                  className="input"
                  type="date"
                  value={query[field] ?? ''}
                  onChange={(e) => change(field, e.target.value)}
                />
              </label>
            ))}
          </>
        )}
        <label className="field">
          <span>Per page</span>
          <select
            className="input"
            value={query.limit ?? '20'}
            onChange={(e) => change('limit', e.target.value)}
          >
            {['10', '20', '50', '100'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <Button variant="ghost" onClick={clear}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
export function RecordPicker({
  kind,
  onSelect,
  selected = [],
}: {
  kind: 'doctors' | 'patients';
  onSelect: (record: Doctor | Patient) => void;
  selected?: string[];
}) {
  const account = useAccount();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const records = useQuery({
    queryKey: [...queryKeys.resource(account.id, kind), 'picker', search, page],
    queryFn: async ({ signal }) =>
      kind === 'doctors'
        ? body(
            await api.GET('/doctors', {
              params: {
                query: {
                  search: search || undefined,
                  page: String(page),
                  limit: '10',
                },
              },
              signal,
            }),
          )
        : body(
            await api.GET('/patients', {
              params: {
                query: {
                  search: search || undefined,
                  page: String(page),
                  limit: '10',
                },
              },
              signal,
            }),
          ),
  });
  return (
    <div className="space-y-3">
      <DebouncedSearch
        key={search}
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        label={`Search ${kind}`}
      />
      {records.isPending ? (
        <Loading />
      ) : records.isError ? (
        <ErrorState
          error={records.error}
          retry={() => void records.refetch()}
        />
      ) : (
        <>
          {!records.data.data.length && <Empty />}
          <div className="max-h-64 space-y-1 overflow-auto">
            {records.data.data.map((record) => (
              <button
                key={record.id}
                type="button"
                className="option flex items-center justify-between gap-3"
                disabled={selected.includes(record.id)}
                onClick={() => onSelect(record)}
              >
                <span className="min-w-0">
                  <span className="block font-medium">{record.name}</span>
                  <span className="block break-all text-xs text-slate-500">
                    {record.email ?? record.phone}
                  </span>
                </span>
                <span className="text-xs font-semibold text-teal-700">
                  {selected.includes(record.id) ? 'Selected' : 'Select'}
                </span>
              </button>
            ))}
          </div>
          <Pagination meta={records.data.meta} onChange={setPage} />
        </>
      )}
    </div>
  );
}
export function PatientTable({
  records,
  base,
  action,
}: {
  records: Patient[];
  base: '/admin/patients' | '/doctor/patients';
  action?: (patient: Patient) => React.ReactNode;
}) {
  if (!records.length) return <Empty />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Condition</th>
            <th>Status</th>
            <th>Contact</th>
            {action && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((patient) => (
            <tr key={patient.id}>
              <td>
                <Link className="record-link" href={`${base}/${patient.id}`}>
                  {patient.name}
                </Link>
                <span className="mt-1 block text-xs text-slate-500">
                  {patient.age} years · {title(patient.gender)}
                </span>
              </td>
              <td className="max-w-xs whitespace-normal">
                {patient.condition || 'Not recorded'}
              </td>
              <td>
                <Badge value={patient.status} />
              </td>
              <td>{patient.phone}</td>
              {action && <td>{action(patient)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

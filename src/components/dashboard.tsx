'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  Stethoscope,
  UsersRound,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { api, body, queryKeys } from '@/lib/api/client';
import { title, dateTime } from '@/lib/utils';
import { useAccount } from './account-context';
import { useListState } from './lists';
import {
  Badge,
  Card,
  DetailGrid,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
} from './shared';

const colors = ['#94a3b8', '#e6ad55', '#268c79', '#d16a65', '#6b9ec3'];
function Stat({
  label,
  count,
  icon: Icon,
}: {
  label: string;
  count: number;
  icon: typeof UsersRound;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className="rounded-lg bg-teal-50 p-2.5 text-teal-700">
          <Icon size={19} />
        </span>
      </div>
      <p className="stat-value">{count.toLocaleString()}</p>
      <p className="mt-1 text-xs text-slate-400">Current records</p>
    </Card>
  );
}
function Trend({
  heading,
  values,
}: {
  heading: string;
  values: { date: string; count: number }[];
}) {
  const total = values.reduce((sum, v) => sum + v.count, 0);
  return (
    <Card>
      <h2>{heading}</h2>
      <p className="mt-1 text-xs text-slate-500">
        {total} records in the selected period
      </p>
      {!total ? (
        <Empty message="No records in this period." />
      ) : (
        <div
          className="chart"
          role="img"
          aria-label={`${heading}: ${total} records`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={values}
              margin={{ right: 10, left: -25, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id={`fill-${heading.replaceAll(' ', '')}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#0f766e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#edf1f4" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.slice(5)}
                minTickGap={35}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="count"
                stroke="#0f766e"
                strokeWidth={2}
                fill={`url(#fill-${heading.replaceAll(' ', '')})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <details className="mt-3 text-xs text-slate-500">
        <summary>View chart data</summary>
        <div className="max-h-48 overflow-auto">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {values.map((v) => (
                <tr key={v.date}>
                  <td>{v.date}</td>
                  <td>{v.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}
function Distribution({
  values,
}: {
  values: { status: string; count: number }[];
}) {
  const total = values.reduce((sum, v) => sum + v.count, 0);
  return (
    <Card>
      <h2>Patient status</h2>
      <p className="mt-1 text-xs text-slate-500">
        A snapshot of current patient records
      </p>
      {total ? (
        <div
          className="chart"
          style={{ height: 190 }}
          role="img"
          aria-label={values
            .map((v) => `${title(v.status)}: ${v.count}`)
            .join(', ')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                isAnimationActive={false}
                data={values}
                dataKey="count"
                nameKey="status"
                innerRadius={57}
                outerRadius={80}
                paddingAngle={3}
                stroke="none"
              >
                {values.map((v, i) => (
                  <Cell key={v.status} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <Empty message="No patient records yet." />
      )}
      <ul className="mt-4 space-y-3">
        {values.map((v, i) => (
          <li
            key={v.status}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-2 text-slate-500">
              <span
                style={{ background: colors[i] }}
                className="size-2 rounded-full"
              />
              {title(v.status)}
            </span>
            <span className="font-semibold">{v.count}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
export function DashboardView() {
  const account = useAccount();
  const { query, change } = useListState(['from', 'to']);
  const result = useQuery({
    queryKey: [...queryKeys.resource(account.id, 'dashboard'), query],
    queryFn: async ({ signal }) =>
      body(await api.GET('/dashboard', { params: { query }, signal })).data,
  });
  const d = result.data;
  return (
    <>
      <PageHeading
        title={
          account.role === 'admin'
            ? 'Care at a glance'
            : account.role === 'doctor'
              ? 'Your care overview'
              : 'Your health, connected'
        }
        description={`Welcome back, ${account.name}. ${account.role === 'patient' ? 'Here is your current care information.' : 'Keep track of your care network and the people in it.'}`}
      />
      {account.role !== 'patient' && (
        <Card>
          <div className="flex flex-wrap items-end gap-4">
            {['from', 'to'].map((field) => (
              <label key={field} className="field">
                <span>{field === 'from' ? 'From' : 'Through'} (Dhaka)</span>
                <input
                  className="input"
                  type="date"
                  value={query[field] ?? ''}
                  onChange={(e) => change(field, e.target.value)}
                />
              </label>
            ))}
            <p className="pb-2 text-xs text-slate-500">
              Default: 30 days · Maximum: 365 days
            </p>
          </div>
        </Card>
      )}
      {result.isPending ? (
        <Loading />
      ) : result.isError ? (
        <ErrorState error={result.error} retry={() => void result.refetch()} />
      ) : d?.role === 'admin' ? (
        <>
          <div className="stat-grid">
            <Stat
              label="Total doctors"
              count={d.totalDoctors}
              icon={Stethoscope}
            />
            <Stat
              label="Total patients"
              count={d.totalPatients}
              icon={UsersRound}
            />
            <Stat
              label="Patients in critical care"
              count={
                d.patientStatusDistribution.find((v) => v.status === 'critical')
                  ?.count ?? 0
              }
              icon={HeartPulse}
            />
          </div>
          <div className="chart-grid">
            <Trend
              heading="Patient creation trend"
              values={d.patientCreationTrend}
            />
            <Distribution values={d.patientStatusDistribution} />
          </div>
          <div className="chart-grid">
            <Trend
              heading="Doctor creation trend"
              values={d.doctorCreationTrend}
            />
            <Card>
              <div className="card-heading">
                <h2>Patients per doctor</h2>
                <Link href="/admin/doctors" className="text-link text-xs">
                  View all <ArrowUpRight className="inline size-3" />
                </Link>
              </div>
              {!d.patientsPerDoctor.length ? (
                <Empty message="No doctors yet." />
              ) : (
                <>
                  <div
                    className="chart"
                    role="img"
                    aria-label="Top ten doctors by patient count"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={d.patientsPerDoctor}
                        layout="vertical"
                        margin={{ left: 10, right: 20 }}
                      >
                        <XAxis type="number" allowDecimals={false} hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          tick={{ fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Bar
                          isAnimationActive={false}
                          dataKey="patientCount"
                          fill="#328e7e"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {d.patientsPerDoctor.map((v) => (
                      <li
                        key={v.doctorId}
                        className="flex justify-between gap-3 text-xs"
                      >
                        <Link
                          href={`/admin/doctors/${v.doctorId}`}
                          className="text-link"
                        >
                          {v.name}
                        </Link>
                        <span>{v.patientCount} patients</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          </div>
          <p className="chart-note">
            {d.range.from} – {d.range.to} · {title(d.range.interval)} buckets ·
            Asia/Dhaka. Trends describe currently stored profiles, not visits or
            medical events. System totals count each patient once.
          </p>
        </>
      ) : d?.role === 'doctor' ? (
        <>
          <div className="stat-grid">
            <Stat
              label="Assigned patients"
              count={d.assignedPatientCount}
              icon={UsersRound}
            />
            <Stat
              label="Patients under treatment"
              count={
                d.patientStatusDistribution.find(
                  (v) => v.status === 'under_treatment',
                )?.count ?? 0
              }
              icon={Activity}
            />
          </div>
          <div className="chart-grid">
            <Trend heading="Assignment trend" values={d.assignmentTrend} />
            <Distribution values={d.patientStatusDistribution} />
          </div>
          <Card>
            <div className="card-heading">
              <h2>Recent assignments</h2>
              <Link className="text-link text-xs" href="/doctor/patients">
                All patients <ArrowUpRight className="inline size-3" />
              </Link>
            </div>
            {!d.recentAssignments.length ? (
              <Empty message="You have no assigned patients yet." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Status</th>
                      <th>Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.recentAssignments.map((v) => (
                      <tr key={v.patientId}>
                        <td>
                          <Link
                            className="record-link"
                            href={`/doctor/patients/${v.patientId}`}
                          >
                            {v.name}
                          </Link>
                        </td>
                        <td>
                          <Badge value={v.status} />
                        </td>
                        <td>{dateTime(v.assignedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="chart-note">
              Showing up to ten recent current assignments.
            </p>
          </Card>
          <p className="chart-note">
            {d.range.from} – {d.range.to} · {title(d.range.interval)} buckets ·
            Asia/Dhaka. Assignment trends describe current assignments, not
            visits.
          </p>
        </>
      ) : d?.role === 'patient' ? (
        <>
          <div className="stat-grid">
            <Stat
              label="Your linked doctors"
              count={d.linkedDoctorCount}
              icon={Stethoscope}
            />
            <Card>
              <p className="text-xs text-slate-500">Current status</p>
              <div className="mt-6">
                <Badge value={d.patient.status} />
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Updated by your care team
              </p>
            </Card>
          </div>
          <Card>
            <h2>Your current care</h2>
            <DetailGrid
              values={{
                Condition: d.patient.condition || 'Not recorded',
                'Last clinical update': dateTime(
                  d.patient.lastClinicalUpdateAt,
                ),
              }}
            />
            <Link
              className="text-link mt-6 inline-block text-sm"
              href="/patient/profile"
            >
              View your profile <ArrowUpRight className="inline size-4" />
            </Link>
          </Card>
          <Card>
            <div className="card-heading">
              <h2>Your care team</h2>
              <Link className="text-link text-xs" href="/patient/doctors">
                All doctors <ArrowUpRight className="inline size-3" />
              </Link>
            </div>
            {!d.linkedDoctors.length ? (
              <Empty message="No doctors are linked yet. Your administrator can help you get connected." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {d.linkedDoctors.map((v) => (
                  <div
                    className="rounded-xl border border-slate-200 p-4"
                    key={v.id}
                  >
                    <Stethoscope className="mb-3 size-5 text-teal-700" />
                    <h3 className="text-sm font-semibold">{v.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {v.specialization}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{v.hospital}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : null}
    </>
  );
}

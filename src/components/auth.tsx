'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, body, resetCsrf } from '@/lib/api/client';
import { portalPath, type Account } from '@/lib/api/types';
import { RecordForm, doctorFields, patientFields, type Field } from './forms';
import { Brand, Logout } from './shell';
import { Button } from './ui/button';
import { Badge } from './shared';
import { ShieldCheck, Clock3, ArrowRight } from 'lucide-react';

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Link href="/login">
          <Brand />
        </Link>
        <div className="my-auto py-16">
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/60 px-3 py-1.5 text-xs font-medium text-teal-800">
            <span className="size-1.5 rounded-full bg-teal-600" />A more
            connected care experience
          </span>
          <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Better connections.
            <br />
            <span className="text-teal-700">Clearer care.</span>
          </h1>
          <p className="mt-6 max-w-md leading-7 text-slate-600">
            One shared view for your care team. Keep patient information
            organized and focus on the people who matter.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-teal-200/70 pt-6">
            {['Organized records', 'Connected teams', 'Personal care'].map(
              (item, i) => (
                <div key={item}>
                  <p className="mb-2 text-xs font-semibold text-teal-700">
                    0{i + 1}
                  </p>
                  <p className="text-sm font-medium text-slate-700">{item}</p>
                </div>
              ),
            )}
          </div>
        </div>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={16} />
          Role-based access for every account
        </p>
      </section>
      <section className="auth-form-panel">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
export function LoginForm({
  expired = false,
  registered = false,
}: {
  expired?: boolean;
  registered?: boolean;
}) {
  const client = useQueryClient();
  const fields: Field[] = [
    { name: 'email', label: 'Email', type: 'email', required: true, max: 254 },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      autoComplete: 'current-password',
      required: true,
      min: 12,
      max: 128,
    },
  ];
  return (
    <AuthFrame>
      <p className="eyebrow">WELCOME BACK</p>
      <h1 className="mt-3 text-3xl">Sign in to your workspace</h1>
      <p className="mb-8 mt-3 text-sm leading-6 text-slate-500">
        Access your records and stay connected with your care team.
      </p>
      {expired && (
        <p
          role="status"
          className="mb-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"
        >
          Your session ended. Please sign in again.
        </p>
      )}
      {registered && (
        <p
          role="status"
          className="mb-5 rounded-lg bg-teal-50 p-4 text-sm text-teal-900"
        >
          Your patient account is ready. Sign in to access your portal.
        </p>
      )}
      <RecordForm
        fields={fields}
        submitLabel="Sign in"
        onSave={async (values) => {
          const user = body(
            await api.POST('/auth/login', {
              body: { email: values.email, password: values.password },
            }),
          ).data;
          await client.cancelQueries();
          client.clear();
          resetCsrf();
          window.location.replace(portalPath(user));
        }}
      />
      <p className="mt-8 text-sm text-slate-500">
        New to Doctor Tracker?{' '}
        <Link className="text-link" href="/register">
          Create an account <ArrowRight className="inline size-3" />
        </Link>
      </p>
    </AuthFrame>
  );
}
export function RegisterForm() {
  const [role, setRole] = useState<'doctor' | 'patient'>('doctor');
  const fields: Field[] = [
    { name: 'name', label: 'Full name', required: true, max: 120 },
    { name: 'email', label: 'Email', type: 'email', required: true, max: 254 },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      min: 12,
      max: 128,
      help: 'Use 12–128 characters.',
    },
    ...(role === 'doctor'
      ? doctorFields.filter((f) => !['name', 'email'].includes(f.name))
      : patientFields.filter((f) => !['name', 'email'].includes(f.name))),
  ];
  return (
    <AuthFrame>
      <p className="eyebrow">JOIN YOUR CARE NETWORK</p>
      <h1 className="mt-3 text-3xl">Create your account</h1>
      <p className="mb-6 mt-3 text-sm leading-6 text-slate-500">
        Patients can sign in immediately after registration. Doctor accounts
        require administrator approval before portal access is enabled.
      </p>
      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-semibold">I am a</legend>
        <div className="grid grid-cols-2 gap-3">
          {(['doctor', 'patient'] as const).map((v) => (
            <label
              key={v}
              className={`cursor-pointer rounded-lg border p-3 text-sm font-medium ${role === v ? 'border-teal-700 bg-teal-50 text-teal-800' : 'border-slate-200'}`}
            >
              <input
                className="mr-2 accent-teal-700"
                type="radio"
                name="role"
                value={v}
                checked={role === v}
                onChange={() => setRole(v)}
              />
              {v === 'doctor' ? 'Doctor' : 'Patient'}
            </label>
          ))}
        </div>
      </fieldset>
      <RecordForm
        key={role}
        fields={fields}
        defaults={{ gender: 'undisclosed' }}
        submitLabel="Submit registration"
        onSave={async (values) => {
          const common = {
            name: values.name,
            email: values.email,
            password: values.password,
          };
          await api.POST('/auth/register', {
            body:
              role === 'doctor'
                ? {
                    ...common,
                    role,
                    profile: {
                      specialization: values.specialization,
                      hospital: values.hospital,
                      phone: values.phone,
                    },
                  }
                : {
                    ...common,
                    role,
                    profile: {
                      dateOfBirth: values.dateOfBirth,
                      gender: values.gender as 'undisclosed',
                      phone: values.phone,
                      ...(values.address ? { address: values.address } : {}),
                    },
                  },
          });
          window.location.replace(
            role === 'patient' ? '/login?registered=1' : '/status?submitted=1',
          );
        }}
      />
      <p className="mt-8 text-sm text-slate-500">
        Already registered?{' '}
        <Link className="text-link" href="/login">
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
export function StatusScreen({ account }: { account?: Account | null }) {
  const rejected = account?.status === 'rejected';
  return (
    <AuthFrame>
      <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <Clock3 size={28} />
      </div>
      {account && (
        <div className="mb-4">
          <Badge value={account.status} />
        </div>
      )}
      <h1 className="text-3xl">
        {rejected
          ? 'Registration not approved'
          : 'Your registration is in review'}
      </h1>
      <p className="mb-6 mt-4 leading-7 text-slate-600">
        {rejected
          ? 'An administrator reviewed your request. Your account does not have portal access.'
          : 'Your details have been submitted. You can sign in to check your approval status.'}
      </p>
      {account?.rejectionReason && (
        <blockquote className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
          <p className="mb-2 font-semibold">Review feedback</p>
          {account.rejectionReason}
        </blockquote>
      )}
      <div className="flex flex-wrap gap-3">
        {account ? (
          <>
            <Button onClick={() => window.location.reload()}>
              Check status
            </Button>
            <Logout />
          </>
        ) : (
          <Button asChild>
            <Link href="/login">Go to sign in</Link>
          </Button>
        )}
      </div>
    </AuthFrame>
  );
}

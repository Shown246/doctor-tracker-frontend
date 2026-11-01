'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
  googleError,
}: {
  expired?: boolean;
  registered?: boolean;
  googleError?: string;
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
      <GoogleSignIn errorCode={googleError} />
      <p className="mt-8 text-sm text-slate-500">
        New to Doctor Tracker?{' '}
        <Link className="text-link" href="/register">
          Create an account <ArrowRight className="inline size-3" />
        </Link>
      </p>
    </AuthFrame>
  );
}
export function RegisterForm({ google = false }: { google?: boolean }) {
  if (google) return <GoogleRegistration />;
  return <PasswordRegistration />;
}
function PasswordRegistration() {
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
      <GoogleSignIn />
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
function GoogleSignIn({ errorCode }: { errorCode?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const message =
    error ||
    (errorCode === 'cancelled'
      ? 'Google Sign-In was cancelled. You can try again.'
      : errorCode === 'state'
        ? 'Google Sign-In expired or could not be verified. Please try again.'
        : errorCode
          ? 'Google Sign-In failed. Please try again or sign in with your password.'
          : '');
  return (
    <div className="my-6">
      <div className="mb-4 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      {message && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {message}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            const result = body(await api.POST('/auth/google/start'));
            window.location.assign(result.data.url);
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : 'Unable to start Google Sign-In.',
            );
            setBusy(false);
          }
        }}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.41 13.91A6 6 0 0 1 6.1 12c0-.66.11-1.3.31-1.91V7.5H3.07A10 10 0 0 0 2 12c0 1.61.38 3.14 1.07 4.5l3.34-2.59Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.97c1.47 0 2.79.51 3.82 1.51l2.86-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.5l3.34 2.59C7.2 7.73 9.4 5.97 12 5.97Z"
          />
        </svg>
        {busy ? 'Connecting to Google…' : 'Continue with Google'}
      </Button>
    </div>
  );
}
function GoogleRegistration() {
  const [identity, setIdentity] = useState<{
    name: string;
    email: string;
    existingAccount: boolean;
  } | null>(null);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'doctor' | 'patient'>('doctor');
  useEffect(() => {
    let active = true;
    api
      .GET('/auth/google/pending')
      .then((result) => {
        if (active) setIdentity(body(result).data);
      })
      .catch((error) => {
        if (active)
          setError(
            error instanceof Error
              ? error.message
              : 'Please try Google Sign-In again.',
          );
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <AuthFrame>
      <p className="eyebrow">CONTINUE WITH GOOGLE</p>
      <h1 className="mt-3 text-3xl">
        {identity?.existingAccount
          ? 'Link your account'
          : 'Complete your profile'}
      </h1>
      {error && (
        <>
          <p role="alert" className="my-4 text-sm text-red-700">
            {error}
          </p>
          <GoogleSignIn />
        </>
      )}
      {!identity && !error && (
        <p role="status" className="my-4">
          Loading your Google account…
        </p>
      )}
      {identity && (
        <>
          <p className="my-5 text-sm text-slate-600">
            {identity.name} · {identity.email}
          </p>
          {identity.existingAccount ? (
            <>
              <p className="mb-5 text-sm text-slate-600">
                An account already uses this email. Enter its password once to
                link Google and sign in.
              </p>
              <RecordForm
                fields={[
                  {
                    name: 'password',
                    label: 'Current password',
                    type: 'password',
                    autoComplete: 'current-password',
                    required: true,
                    min: 12,
                    max: 128,
                  },
                ]}
                submitLabel="Link Google and sign in"
                onSave={async (values) => {
                  const account = body(
                    await api.POST('/auth/google/link', {
                      body: { password: values.password },
                    }),
                  ).data;
                  resetCsrf();
                  window.location.replace(portalPath(account));
                }}
              />
            </>
          ) : (
            <>
              <p className="mb-5 text-sm text-slate-600">
                Patients get immediate access. Doctor accounts require
                administrator approval.
              </p>
              <fieldset className="mb-6">
                <legend className="mb-2 text-sm font-semibold">I am a</legend>
                <div className="flex gap-6">
                  {(['doctor', 'patient'] as const).map((value) => (
                    <label key={value} className="text-sm">
                      <input
                        type="radio"
                        className="mr-2 accent-teal-700"
                        name="google-role"
                        checked={role === value}
                        onChange={() => setRole(value)}
                      />
                      {value === 'doctor' ? 'Doctor' : 'Patient'}
                    </label>
                  ))}
                </div>
              </fieldset>
              <RecordForm
                key={role}
                fields={(role === 'doctor'
                  ? doctorFields
                  : patientFields
                ).filter((field) => !['name', 'email'].includes(field.name))}
                defaults={{ gender: 'undisclosed' }}
                submitLabel="Complete registration"
                onSave={async (values) => {
                  const profile =
                    role === 'doctor'
                      ? {
                          specialization: values.specialization,
                          hospital: values.hospital,
                          phone: values.phone,
                        }
                      : {
                          dateOfBirth: values.dateOfBirth,
                          gender: values.gender as 'undisclosed',
                          phone: values.phone,
                          ...(values.address
                            ? { address: values.address }
                            : {}),
                        };
                  const account = body(
                    await api.POST('/auth/google/register', {
                      body:
                        role === 'doctor'
                          ? {
                              role,
                              profile: profile as {
                                specialization: string;
                                hospital: string;
                                phone: string;
                              },
                            }
                          : {
                              role,
                              profile: profile as {
                                dateOfBirth: string;
                                gender: 'undisclosed';
                                phone: string;
                                address?: string;
                              },
                            },
                    }),
                  ).data;
                  resetCsrf();
                  window.location.replace(portalPath(account));
                }}
              />
            </>
          )}
        </>
      )}
      <p className="mt-6 text-sm">
        <Link href="/login" className="text-link">
          Back to sign in
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

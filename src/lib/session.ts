import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { backendOrigin } from './backend-origin';
import type { Account, Role } from './api/types';
import { portalPath } from './api/types';

export async function readSession(): Promise<Account | null> {
  const cookie = (await cookies()).get('doctor_tracker.sid');
  if (!cookie) return null;
  const response = await fetch(`${backendOrigin()}/api/v1/auth/me`, {
    headers: {
      Cookie: `doctor_tracker.sid=${encodeURIComponent(decodeURIComponent(cookie.value))}`,
    },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(12_000),
  });
  if (response.status === 401) return null;
  if (response.status === 403) redirect('/access-denied');
  if (!response.ok)
    throw new Error('The backend is temporarily unavailable. Please retry.');
  return (await response.json()).data as Account;
}
export async function requireSession(role?: Role) {
  const account = await readSession();
  if (!account) redirect('/login');
  if (account.status !== 'active') redirect('/status');
  if (role && account.role !== role) redirect(portalPath(account));
  return account;
}

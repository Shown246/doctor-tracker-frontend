import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { portalPath } from '@/lib/api/types';
export default async function Page() {
  const account = await readSession();
  redirect(account ? portalPath(account) : '/login');
}

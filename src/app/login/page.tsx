import { readSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { portalPath } from '@/lib/api/types';
import { LoginForm } from '@/components/auth';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; registered?: string }>;
}) {
  const account = await readSession();
  if (account) redirect(portalPath(account));
  const params = await searchParams;
  return (
    <LoginForm
      expired={params.reason === 'expired'}
      registered={params.registered === '1'}
    />
  );
}

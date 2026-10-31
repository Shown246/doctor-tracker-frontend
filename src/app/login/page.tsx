import { readSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { portalPath } from '@/lib/api/types';
import { LoginForm } from '@/components/auth';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const account = await readSession();
  if (account) redirect(portalPath(account));
  return <LoginForm expired={(await searchParams).reason === 'expired'} />;
}

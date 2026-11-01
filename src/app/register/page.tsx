import { readSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { portalPath } from '@/lib/api/types';
import { RegisterForm } from '@/components/auth';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const account = await readSession();
  if (account) redirect(portalPath(account));
  return <RegisterForm google={(await searchParams).google === '1'} />;
}

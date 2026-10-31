import { readSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { portalPath } from '@/lib/api/types';
import { StatusScreen } from '@/components/auth';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const account = await readSession();
  if (account?.status === 'active') redirect(portalPath(account));
  if (!account && (await searchParams).submitted !== '1') redirect('/login');
  return <StatusScreen account={account} />;
}

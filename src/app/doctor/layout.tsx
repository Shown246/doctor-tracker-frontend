import { requireSession } from '@/lib/session';
import { Shell } from '@/components/shell';
import { AccountProvider } from '@/components/account-context';
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requireSession('doctor');
  return (
    <AccountProvider account={account}>
      <Shell account={account}>{children}</Shell>
    </AccountProvider>
  );
}

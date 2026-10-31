'use client';
import { createContext, useContext } from 'react';
import type { Account } from '@/lib/api/types';
const AccountContext = createContext<Account | null>(null);
export function AccountProvider({
  account,
  children,
}: {
  account: Account;
  children: React.ReactNode;
}) {
  return (
    <AccountContext.Provider value={account}>
      {children}
    </AccountContext.Provider>
  );
}
export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error('Account context is unavailable');
  return account;
}

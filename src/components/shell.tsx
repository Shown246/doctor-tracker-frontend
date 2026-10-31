'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowUpRight,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { ApiError, api, body, resetCsrf } from '@/lib/api/client';
import type { Account } from '@/lib/api/types';
import { title, cn } from '@/lib/utils';
import { Button } from './ui/button';
import { toast } from 'sonner';

const nav = {
  admin: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { href: '/admin/patients', label: 'Patients', icon: UsersRound },
    { href: '/admin/registrations', label: 'Registrations', icon: ShieldCheck },
  ],
  doctor: [
    { href: '/doctor', label: 'Overview', icon: LayoutDashboard },
    { href: '/doctor/patients', label: 'My patients', icon: UsersRound },
    { href: '/doctor/profile', label: 'My profile', icon: UserRound },
  ],
  patient: [
    { href: '/patient', label: 'Overview', icon: LayoutDashboard },
    { href: '/patient/profile', label: 'My profile', icon: UserRound },
    { href: '/patient/doctors', label: 'My doctors', icon: Stethoscope },
  ],
};
export function Brand() {
  return (
    <span className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white">
        <HeartPulse size={23} />
      </span>
      <span className="text-lg font-bold tracking-tight">
        Doctor<span className="text-teal-700">Tracker</span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
          Connected care
        </span>
      </span>
    </span>
  );
}
export function Logout() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api.POST('/auth/logout', { body: {} });
          resetCsrf();
          window.dispatchEvent(
            new CustomEvent('session-leave', { detail: '/login' }),
          );
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            resetCsrf();
            window.dispatchEvent(
              new CustomEvent('session-leave', { detail: '/login' }),
            );
            return;
          }
          toast.error(
            error instanceof Error
              ? error.message
              : 'Logout failed. Please retry.',
          );
          setBusy(false);
        }
      }}
    >
      <LogOut />
      {busy ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
export function Shell({
  account,
  children,
}: {
  account: Account;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    sidebar.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);
  useQuery({
    queryKey: ['session', account.id],
    queryFn: async () => {
      const user = body(await api.GET('/auth/me')).data;
      if (
        user.id !== account.id ||
        user.role !== account.role ||
        user.status !== account.status
      ) {
        resetCsrf();
        window.dispatchEvent(
          new CustomEvent('session-leave', {
            detail: user.status === 'active' ? `/${user.role}` : '/status',
          }),
        );
      }
      return user;
    },
    initialData: account,
    staleTime: 0,
    refetchInterval: 30_000,
    retry: false,
  });
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {open && (
        <button
          className="fixed inset-0 z-20 bg-slate-950/40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        ref={sidebar}
        aria-label="Primary navigation"
        className={cn('sidebar', open && 'sidebar-open')}
      >
        <div className="flex items-center justify-between">
          <Link href={`/${account.role}`} aria-label="Doctor Tracker home">
            <Brand />
          </Link>
          <Button
            className="lg:hidden"
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
        <p className="mb-4 mt-12 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {account.role} workspace
        </p>
        <nav className="space-y-2">
          {nav[account.role].map((item) => {
            const active =
              item.href === `/${account.role}`
                ? path === item.href
                : path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn('nav-link', active && 'nav-active')}
              >
                <item.icon size={18} />
                {item.label}
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-teal-700" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-12">
          <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
            <Activity size={21} className="mb-3 text-teal-700" />
            <p className="text-sm font-semibold text-teal-900">
              Care, in one place.
            </p>
            <p className="mt-1 text-xs leading-5 text-teal-800">
              A clearer view of every connection.
            </p>
            <ArrowUpRight className="mt-3 size-4 text-teal-700" />
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <Logout />
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <Button
              ref={menuButton}
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <Menu />
            </Button>
            <span className="text-sm text-slate-500">
              Workspace <span className="mx-2 text-slate-300">/</span>
              <span className="font-medium text-slate-700">
                {title(path.split('/')[2] ?? 'Overview')}
              </span>
            </span>
          </div>
          <details className="account-menu">
            <summary
              aria-label="Account menu"
              className="flex cursor-pointer items-center gap-3 rounded-lg"
            >
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-semibold">
                  {account.name}
                </span>
                <span className="block text-xs text-slate-500">
                  {title(account.role)} portal
                </span>
              </span>
              <span
                className="flex size-10 items-center justify-center rounded-full border border-teal-100 bg-teal-50 text-sm font-bold text-teal-800"
                aria-label={account.name}
              >
                {account.name.slice(0, 2).toUpperCase()}
              </span>
            </summary>
            <div className="account-panel">
              <p className="text-sm font-semibold">{account.name}</p>
              <p className="mt-1 break-all text-xs text-slate-500">
                {account.email}
              </p>
              {account.role !== 'admin' && (
                <Link
                  className="text-link my-4 block text-sm"
                  href={`/${account.role}/profile`}
                >
                  My profile
                </Link>
              )}
              <div className="mt-3 border-t border-slate-100 pt-2">
                <Logout />
              </div>
            </div>
          </details>
        </header>
        <main id="main" tabIndex={-1} className="main-content">
          {children}
        </main>
        <footer className="px-6 pb-6 text-xs text-slate-400">
          Doctor Tracker · Connected care, clearly.
        </footer>
      </div>
    </div>
  );
}

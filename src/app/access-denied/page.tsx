import Link from 'next/link';
import { AuthFrame } from '@/components/auth';
import { Logout } from '@/components/shell';
export default function Page() {
  return (
    <AuthFrame>
      <h1>Access unavailable</h1>
      <p className="my-5 text-slate-600">
        Your account or linked profile is unavailable. Contact your
        administrator or sign in with another account.
      </p>
      <Logout />
      <p className="mt-5">
        <Link className="text-link" href="/login">
          Return to sign in
        </Link>
      </p>
    </AuthFrame>
  );
}

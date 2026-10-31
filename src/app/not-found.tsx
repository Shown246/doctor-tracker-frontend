import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg p-10">
      <p className="eyebrow">404</p>
      <h1 className="my-4">Page not found</h1>
      <p className="mb-6 text-slate-600">
        This page does not exist or is unavailable for your account.
      </p>
      <Link className="text-link" href="/">
        Return to your workspace
      </Link>
    </main>
  );
}

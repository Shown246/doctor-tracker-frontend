// Used only by Next configuration and server-only session code. Never expose as NEXT_PUBLIC_*.
export function backendOrigin() {
  const value = process.env.BACKEND_ORIGIN ?? 'http://localhost:4000';
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.origin !== value ||
    url.username ||
    url.password
  ) {
    throw new Error(
      'BACKEND_ORIGIN must be an exact HTTP(S) origin without credentials or a path',
    );
  }
  return value;
}

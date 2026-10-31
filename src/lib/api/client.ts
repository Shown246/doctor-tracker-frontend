import createClient from 'openapi-fetch';
import type { paths } from './schema';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string[]>,
    public requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
let csrfToken: string | undefined;
let csrfPending: Promise<string> | undefined;
export function resetCsrf() {
  csrfToken = undefined;
  csrfPending = undefined;
}

async function parseFailure(response: Response) {
  const body = await response.json().catch(() => null);
  return new ApiError(
    response.status,
    body?.error?.code ?? 'SERVER_UNAVAILABLE',
    body?.error?.message ??
      'The service is temporarily unavailable. Please try again.',
    body?.error?.fieldErrors,
    body?.error?.requestId,
  );
}
async function csrf(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfPending) {
    csrfPending = fetch('/api/v1/auth/csrf', {
      credentials: 'same-origin',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) throw await parseFailure(response);
        const value = await response.json();
        csrfToken = value.data.csrfToken;
        return csrfToken!;
      })
      .finally(() => {
        csrfPending = undefined;
      });
  }
  return csrfPending;
}
export async function secureFetch(request: Request) {
  const headers = new Headers(request.headers);
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method))
    headers.set('X-CSRF-Token', await csrf());
  let response: Response;
  try {
    response = await fetch(
      new Request(request, {
        headers,
        credentials: 'same-origin',
        cache: 'no-store',
      }),
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Cannot reach the server. Check your connection and try again.',
    );
  }
  if (!response.ok) {
    const error = await parseFailure(response);
    if (error.code === 'CSRF_INVALID') {
      resetCsrf();
      await csrf().catch(() => undefined);
    }
    const authForm = /\/auth\/(login|register|csrf|logout)$/.test(
      new URL(request.url).pathname,
    );
    if (
      !authForm &&
      (error.status === 401 ||
        [
          'ACCOUNT_INACTIVE',
          'ACCOUNT_DISABLED',
          'PROFILE_UNAVAILABLE',
        ].includes(error.code))
    ) {
      resetCsrf();
      if (typeof window !== 'undefined')
        window.dispatchEvent(
          new CustomEvent('session-invalid', { detail: error }),
        );
    }
    // Never replay mutations, including failures with uncertain completion.
    throw error;
  }
  return response;
}
export const api = createClient<paths>({
  baseUrl: '/api/v1',
  fetch: secureFetch,
});
export function body<T>(result: { data?: T; response: Response }): T {
  if (result.data === undefined)
    throw new ApiError(
      result.response.status,
      'EMPTY_RESPONSE',
      'The server returned an incomplete response. Please retry.',
    );
  return result.data;
}
export const queryKeys = {
  account: (id: string) => ['account', id] as const,
  resource: (id: string, resource: string) =>
    ['account', id, resource] as const,
};
export function retryRead(count: number, error: Error) {
  return (
    count < 1 &&
    (!(error instanceof ApiError) || error.status === 0 || error.status >= 500)
  );
}

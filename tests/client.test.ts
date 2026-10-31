import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, resetCsrf, retryRead, secureFetch } from '@/lib/api/client';
afterEach(() => {
  resetCsrf();
  vi.unstubAllGlobals();
});
const csrfResponse = () =>
  new Response(JSON.stringify({ data: { csrfToken: 'a'.repeat(64) } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
describe('typed transport', () => {
  it('bootstraps CSRF, uses credentials and accepts an empty 204', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(csrfResponse())
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetcher);
    const response = await secureFetch(
      new Request('http://localhost/api/v1/auth/logout', {
        method: 'POST',
        body: '{}',
      }),
    );
    expect(response.status).toBe(204);
    const request = fetcher.mock.calls[1][0] as Request;
    expect(request.headers.get('X-CSRF-Token')).toBe('a'.repeat(64));
    expect(request.credentials).toBe('same-origin');
  });
  it('refreshes a rejected CSRF token without replaying a mutation', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(csrfResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { code: 'CSRF_INVALID', message: 'Invalid token' },
          }),
          { status: 403 },
        ),
      )
      .mockResolvedValueOnce(csrfResponse());
    vi.stubGlobal('fetch', fetcher);
    await expect(
      secureFetch(
        new Request('http://localhost/api/v1/patients', {
          method: 'POST',
          body: '{}',
        }),
      ),
    ).rejects.toMatchObject({ code: 'CSRF_INVALID' });
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(
      fetcher.mock.calls.filter((call) => call[0] instanceof Request),
    ).toHaveLength(1);
  });
  it('does not retry authorization, validation or revision failures', () => {
    for (const status of [400, 401, 403, 404, 409, 429])
      expect(retryRead(0, new ApiError(status, 'ERROR', 'Error'))).toBe(false);
    expect(retryRead(0, new ApiError(503, 'ERROR', 'Error'))).toBe(true);
    expect(retryRead(1, new ApiError(503, 'ERROR', 'Error'))).toBe(false);
  });
});

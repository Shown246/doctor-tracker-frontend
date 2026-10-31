# Frontend architecture

This is an independent Next.js App Router application. Its only production dependency on the backend is the vendored OpenAPI contract and HTTP API. Application code does not import backend source, database drivers or session secrets.

## Session and request flow

Browser requests use `/api/v1` on the frontend origin. The external rewrite in `next.config.ts` forwards to the server-only `BACKEND_ORIGIN`. Express owns its host-only `doctor_tracker.sid` HttpOnly cookie. Server layouts forward only that cookie to the configured origin, disable caching, reject redirects and validate current account status/role with `/auth/me`.

The browser transport obtains a session-bound CSRF token before mutations, shares in-flight token acquisition, and resets the token after login/logout. An invalid token is refreshed for the user's next attempt; a mutation is never automatically replayed. Reads retry at most once for network/server failures. JSON API errors retain field errors and request references; proxy failures receive a recoverable message. Empty 204 responses are supported.

Each private query key starts with `['account', accountId, resource]`. Changes invalidate affected resources for the current account. Logout cancels requests, clears the entire cache and CSRF state, and performs a full navigation. Session polling, focus revalidation, backend authorization failures and browser history restoration cover stale account state. Backend authorization remains authoritative.

## Roles

| Capability              | Admin                                | Doctor                      | Patient                |
| ----------------------- | ------------------------------------ | --------------------------- | ---------------------- |
| Review registrations    | Approve/create, approve/link, reject | —                           | —                      |
| Doctor profiles         | Create, read, edit                   | Own, read-only              | Linked summaries       |
| Patient profiles        | Create, read, edit, delete           | Assigned records            | Own record             |
| Assignments             | Link/unlink                          | Read current links          | Read own links         |
| Shared condition/status | Edit with revision                   | Edit assigned with revision | Read-only              |
| Private notes           | Read with author attribution         | Own note with revision      | Hidden                 |
| Patient contact         | Edit                                 | Read                        | Own phone/address only |
| Dashboard               | System totals                        | Current assignments         | Own care               |

## Lists and editing

Search, filters, sort and pagination live in URL parameters. Search uses a 350ms debounce, supported query fields are whitelisted per endpoint, and changed filters reset page one. Dynamic filter options and assignment pickers use bounded backend pages. Patient deletion corrects an empty last list page.

Clinical and note editors retain the revision that was loaded with their draft. Background reads do not advance that draft's revision. A 409 keeps the draft visible and requires loading/reviewing the latest version before another save. Notes use their own independent revision. Inactive private-note queries are discarded, and lost patient scope removes that patient's note cache before a later relink. Clearing notes, unlinking and patient deletion require accessible confirmation and wait for backend success.

Registration approval preserves submitted fields; the API does not allow an admin to rewrite a pending submission. Linking requires the same normalized email and preserves the existing profile. The API authoritatively verifies that the chosen profile is unclaimed. Existing profile DTOs do not expose linkage flags, so an attempted linked-email change is recovered from `EMAIL_IMMUTABLE`, restoring and locking that field while preserving other entered values.

## Components

`components/ui` contains locally owned shadcn-style Radix primitives. `forms.tsx` centralizes React Hook Form/Zod validation, labels and server field errors. `lists.tsx` provides URL controls, bounded option lookup, pickers and pagination. Feature components cover management, registration review, clinical care, profiles and Recharts dashboards. Charts include visible text summaries/data and empty states.

Reference documentation: [Next.js external rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites), [shadcn/ui manual installation](https://ui.shadcn.com/docs/installation/manual), [TanStack Query retries](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries).

# Doctor Tracker frontend

Independent Next.js 16 App Router application for administrators, doctors and patients. Built with strict TypeScript, React 19, Tailwind CSS 4, locally owned shadcn/Radix primitives, TanStack Query, React Hook Form, Zod and Recharts.

Milestone 5 uses backend **`1.0.0-rc.1`** from implementation commit **`280331b`**, with handoff **`fc3d947`**. The owner explicitly deferred Render deployment, stable `v1.0.0` publication and Git publishing on 2026-10-31. This repository is local on `main`, without a remote. Hosted integration remains Milestone 6 work.

## Local setup

Use **Node.js 24 LTS** and **npm 11**. All direct dependency versions and the lockfile are committed.

First configure the independent backend using its README. Use a development database and set its `FRONTEND_ORIGIN` to exactly `http://localhost:3000`. Start it in a separate terminal:

```powershell
cd E:\Codes\Doctor\doctor-tracker-backend
npm ci
npm run db:indexes
npm run dev
```

Then start this application:

```powershell
cd E:\Codes\Doctor\doctor-tracker-frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open [localhost:3000](http://localhost:3000). Provision an administrator through the backend's private `npm run admin:create` command. Doctor/patient registration requires administrator approval. No real or persistent demo credentials are shipped.

Production build and local start:

```powershell
npm run build
npm start
```

## Configuration and HTTP

| Variable         | Purpose                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `BACKEND_ORIGIN` | Server-only exact HTTP(S) origin; defaults to `http://localhost:4000`. No path, credentials or trailing slash. Restart Next after changing it. |
| `NEXT_DIST_DIR`  | Optional isolated build directory; the E2E runner uses `.next-e2e`. Leave unset for normal use.                                                |

The browser always uses same-origin `/api/v1`; Next externally rewrites it to Express. Server layouts forward only the session cookie to this configured origin, use uncached requests and validate role/status. Keep MongoDB URIs, session secrets and admin credentials exclusively in the backend. Do not create a `NEXT_PUBLIC_BACKEND_ORIGIN` variable.

Use the same hostname consistently: `localhost` and `127.0.0.1` are different cookie/origin scopes. Development uses non-Secure cookies; hosted HTTPS cookie/proxy verification is deferred. The frontend and backend remain independently deployable.

## Contract provenance and regeneration

`contracts/openapi.json` is a vendored artifact; `contracts/provenance.json` records the exact version, backend references, owner-authorized deviation and SHA-256 checksum. `src/lib/api/schema.d.ts` is generated and committed. Generation uses this artifact, without importing backend source or requiring a live server:

```powershell
npm run api:generate
npm run api:check
```

To update later, obtain a reviewed artifact from the verified backend release, replace the vendored JSON, update provenance/version/checksum, regenerate, inspect the diff and rerun checks. The generator rejects a checksum/version mismatch. Do not label this candidate as the unpublished stable release.

## Pages

| Portal  | Routes and workflows                                                                                                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared  | `/login`, `/register`, `/status`, `/access-denied`, not-found/error/loading states                                                                                                                     |
| Admin   | `/admin` analytics; `/admin/doctors` list/create/edit/detail/assignments; `/admin/patients` list/create/edit/detail/notes/delete; `/admin/registrations` list/review/create-or-link approval/rejection |
| Doctor  | `/doctor` analytics; `/doctor/patients` scoped list/detail/clinical editing/private note; `/doctor/profile` read-only                                                                                  |
| Patient | `/patient` own-care dashboard; `/patient/profile` own information and phone/address editing; `/patient/doctors` paginated linked summaries                                                             |

Lists persist search/filter/sort/page state in the URL. Date controls use inclusive Asia/Dhaka calendar dates. Dashboard trends default to 30 days, accept at most 365 days, use daily buckets through 90 days and monthly buckets afterward. Trends describe stored records/current assignments, rather than visits.

Clinical and note changes use the draft's last-read revision. A conflict keeps the draft and prompts an explicit refresh/review. Destructive actions explain their effects and wait for confirmation and backend success. Logout cancels requests and clears private data. See [architecture and permissions](docs/architecture.md).

## Verification

```powershell
npm run api:check
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

Component/transport tests run without a backend. Browser journeys use a real independent backend and isolated MongoDB replica set, without API mocks:

```powershell
# Install backend dependencies first, including its cached MongoDB test binary.
npx playwright install chromium
npm run test:e2e
```

The runner defaults to the sibling `../doctor-tracker-backend` checkout. Set `E2E_BACKEND_DIR` if it lives elsewhere. It checks that ports **3100/4100** are unused, starts a temporary MongoDB replica set, explicitly creates indexes and synthetic fixtures, builds/starts Express with development cookies, starts Next with a separate output directory, runs Playwright, then stops servers and the temporary database. Normal development servers on 3000/4000 and the configured Atlas database are not used by these tests. All test account passwords are generated per run.

`E2E_CHANNEL=chrome` can use installed Google Chrome. `npm run test:e2e:external` instead targets an explicitly prepared disposable environment with `E2E_BASE_URL`, `E2E_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_DOCTOR_EMAIL` and `E2E_PATIENT_EMAIL`; it performs writes and expects the documented synthetic fixtures. Use the isolated runner by default.

Playwright covers signup/approval, rejection, existing-profile linking, management, revisions, note privacy, unlink/relink, permanent deletion, patient contact editing, wrong-role routes, session loss, account changes, mobile navigation and accessibility checks. Screenshots and failure traces are stored under ignored `test-results`; open the HTML report with `npx playwright show-report`.

The initial GitHub Actions workflow runs deterministic contract, formatting, lint, types, component tests and build checks. It has not run on GitHub because publication is deferred. Real-backend E2E CI and hosted HTTPS checks belong to Milestone 6.

See [validation results and remaining work](docs/milestone-05-validation.md).

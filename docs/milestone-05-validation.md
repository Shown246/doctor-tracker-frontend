# Milestone 5 local validation

Validated on **2026-10-31**, Windows, Node.js **24.18.0**, npm **11.15.0**.

## Scope and references

- Application: `E:\Codes\Doctor\doctor-tracker-frontend`, local Git branch `main`.
- Implementation commit: **`223f032` — Build the admin, doctor and patient portals**. This validation record and screenshots are committed separately.
- Backend: **`1.0.0-rc.1`**, implementation **`280331b`**, handoff **`fc3d947`**. The vendored contract was checked byte-for-byte against `280331b:docs/openapi.json`.
- Contract SHA-256: `b81ed89fb858d1645e06ae5e8c7c2a995f649ed173bd49d6e90d0b428559086d`.
- The owner explicitly authorized local frontend implementation before the hosted backend gate, chose this frontend location, requested `npm run dev` for normal backend use, and deferred deployment and Git publishing. No remote, push, tag or deployment was created.

## Checks

| Command/check                 | Result                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `npm ci`                      | Clean install passed; 539 packages installed; audit reported zero vulnerabilities |
| `npm run api:check`           | Generated definitions match the checksummed contract                              |
| `npm run lint`                | Passed with zero warnings                                                         |
| `npm run format:check`        | Passed                                                                            |
| `npm run typecheck`           | Next route generation and strict TypeScript passed                                |
| `npm test`                    | **13 tests passed in 5 suites**                                                   |
| `npm run test:e2e`            | **9 journeys passed**, default Playwright Chromium, **1.9 minutes**               |
| `npm run build`               | Optimized production build and route generation passed                            |
| `git diff --cached --check`   | Passed before the implementation commit                                           |
| Backend development readiness | `http://localhost:4000/health/ready` returned 200                                 |

The E2E runner used a temporary MongoDB 8.2.6 replica set, explicit indexes and synthetic seeds, the independently built Express service on port 4100 with development cookies, and Next on port 3100 with `.next-e2e` output. Browser API traffic passed through the real external rewrite. No API mocks, Atlas fixture writes or normal-server reuse were involved. Test services/database were stopped after completion. The normal backend remains available through `npm run dev` on port 4000.

## Verified journeys

1. Doctor and patient public signup, pending access restrictions, admin create-profile approval and correct role routing.
2. Admin doctor creation/editing, patient creation with initial assignment, patient editing, unlink cancellation/confirmation, existing-patient linking and permanent patient deletion.
3. Doctor clinical editing on mobile, own-note saving/admin review, clinical revision conflict with preserved draft, assignment revocation while the page remains open, relinking with an empty note without a full reload, and note clearing.
4. Patient phone/address editing on mobile, read-only clinical fields, linked-email immutability and recovery in admin editing, linked doctors, altered/wrong-role routes, logout, account switching and session loss.
5. URL search/filter/sort/page persistence and page reset, desktop dashboard, mobile navigation, page-width bounds, required-form focus/errors and keyboard navigation.
6. Rejected registration feedback and denied portal/API access.
7. Approval linking an existing matching profile while preserving its professional details; doctor profile remains read-only.
8. Concurrent private-note edits return a conflict, retain the stale draft and require loading the latest note.
9. Deleting an account-linked patient revokes the current session, hides private UI, permits logout and denies a later login.

Component tests cover recoverable server field errors, impossible birth dates, clinical conflicts, immutable linked email, confirmation cancellation/pending/failure behavior, URL filter transformations, debounced search, CSRF bootstrap/refresh, empty 204 responses and read-only retries.

## Visual and accessibility review

Reviewed the desktop dashboard at 1280px and mobile pages at 390 × 844. Confirmed readable forms, mobile navigation, text/field focus, chart sizing and textual summaries, empty states and horizontally scrollable tables. Chart animations are disabled so values appear immediately; mobile tables retain readable column widths. Axe reported **zero detected WCAG 2 A/AA violations on the tested admin dashboard and mobile login page**. This is scoped automated evidence, not a claim that every accessibility criterion has been audited.

- [Admin dashboard](screenshots/admin-desktop.png)
- [Mobile patient list](screenshots/patients-mobile.png)
- [Mobile login with keyboard focus](screenshots/login-mobile.png)
- [Mobile doctor clinical/note editor](screenshots/doctor-patient-mobile.png)
- [Mobile patient contact editor](screenshots/patient-profile-mobile.png)

## Deferred work

No local implementation blocker remains. Public repository creation/pushing, hosted CI execution, Render/Vercel deployment, HTTPS cookie/proxy verification, the hosted Milestone 4 gate and stable `v1.0.0` contract publication are **explicitly deferred by the owner**. The initial frontend CI workflow is prepared but has not run on GitHub. Milestone 6 remains separate.

Existing backend documentation relocations and other pre-existing working-tree changes were preserved. No backend application source was changed. The source implementation plan/checklist record the owner's local scope and completed frontend work.

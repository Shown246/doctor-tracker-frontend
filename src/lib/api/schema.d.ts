export interface paths {
    "/doctors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List doctors and patient counts (admin)
         * @description Defaults: page=1, limit=20 (maximum 100), sort=-createdAt. Sort supports createdAt, -createdAt, name, -name with _id in the same direction as a stable tie-breaker. search is a normalized, escaped literal prefix of full fields or word tokens. Exact descriptor filters are normalized. from/to are inclusive YYYY-MM-DD creation dates in Asia/Dhaka using IANA timezone rules. Reversed/invalid ranges and unknown parameters are rejected. Missing pages are empty; totalPages=0 for no matches.
         */
        get: operations["get_doctors"];
        put?: never;
        /**
         * Create a doctor profile (admin)
         * @description Requires an active account and valid linked profile. Responses are private, no-store.
         */
        post: operations["post_doctors"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/doctors/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read a doctor (admin)
         * @description Requires an active account and valid linked profile. Responses are private, no-store.
         */
        get: operations["get_doctors__id_"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Edit doctor fields (admin)
         * @description Only listed fields are editable. Email is immutable after account linkage, including disabled linked accounts. Search keys are regenerated. Competing writes retry transactionally.
         */
        patch: operations["patch_doctors__id_"];
        trace?: never;
    };
    "/patients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List patients (admin)
         * @description Defaults: page=1, limit=20 (maximum 100), sort=-createdAt. Sort supports createdAt, -createdAt, name, -name with _id in the same direction as a stable tie-breaker. search is a normalized, escaped literal prefix of full fields or word tokens. Exact descriptor filters are normalized. from/to are inclusive YYYY-MM-DD creation dates in Asia/Dhaka using IANA timezone rules. Reversed/invalid ranges and unknown parameters are rejected. Missing pages are empty; totalPages=0 for no matches.
         */
        get: operations["get_patients"];
        put?: never;
        /**
         * Create a patient and optional initial assignments (admin)
         * @description Creates the patient and all initial assignments atomically. doctorIds accepts at most 100 IDs and is deduplicated case-insensitively. Missing doctors abort the transaction. Email is optional and unique when present; null omits it. Empty/null address and empty condition are stored as absent. Birth dates must be real dates from 1900 through today in Asia/Dhaka. Age is derived.
         */
        post: operations["post_patients"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patients/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read patient and linked-doctor summaries (admin)
         * @description Includes linkedDoctors with linkedDoctorsMeta and the full linkedDoctorCount. page/limit paginate these summaries (default 20, maximum 100), newest assignments first. Notes are available only through the separate admin review endpoint.
         */
        get: operations["get_patients__id_"];
        put?: never;
        post?: never;
        /**
         * Permanently delete a patient (admin)
         * @description Atomically removes the patient and every association/private note, disables its linked patient account and clears the profile reference. Existing patient sessions lose portal access. Concurrent assignment/clinical/note writes serialize with deletion. A missing patient returns 404.
         */
        delete: operations["delete_patients__id_"];
        options?: never;
        head?: never;
        /**
         * Edit demographics or shared clinical fields (admin)
         * @description Assignments and internal fields are forbidden. Email cannot change or be removed after account linkage. A clinical change requires the last-read revision and increments it, recording the editor and UTC time. A revision without clinical fields is rejected. Empty condition clears it; null email/address clears those optional fields.
         */
        patch: operations["patch_patients__id_"];
        trace?: never;
    };
    "/doctors/{doctorId}/patients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List patients assigned to a doctor (admin)
         * @description Defaults: page=1, limit=20 (maximum 100), sort=-createdAt. Sort supports createdAt, -createdAt, name, -name with _id in the same direction as a stable tie-breaker. search is a normalized, escaped literal prefix of full fields or word tokens. Exact descriptor filters are normalized. from/to are inclusive YYYY-MM-DD creation dates in Asia/Dhaka using IANA timezone rules. Reversed/invalid ranges and unknown parameters are rejected. Missing pages are empty; totalPages=0 for no matches. The path doctor must exist. Any doctorId query filter intersects the path scope.
         */
        get: operations["get_doctors__doctorId__patients"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/doctors/{doctorId}/patients/{patientId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Link a doctor and patient (admin)
         * @description No body or {}. Both profiles must exist. Repeated and simultaneous links succeed with one association and preserve its assignment date and note.
         */
        put: operations["put_doctors__doctorId__patients__patientId_"];
        post?: never;
        /**
         * Unlink a doctor and delete that doctor's note (admin)
         * @description No body or {}. Deletes the association and its note together. Other doctors and the patient remain. The removed doctor immediately loses access. Repeated removal succeeds if both profiles exist. Relinking starts with an empty note at revision zero.
         */
        delete: operations["delete_doctors__doctorId__patients__patientId_"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patients/{patientId}/doctor-notes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Review private notes with doctor attribution (admin, read-only)
         * @description Paginated nonempty notes, most recently updated first with _id tie-breaker. Cleared/empty notes are excluded. Admin cannot mutate notes.
         */
        get: operations["get_patients__patientId__doctor_notes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read the session-linked doctor or patient profile
         * @description Requires an active account and valid linked profile. Responses are private, no-store.
         */
        get: operations["get_me_profile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update own phone/address (patient)
         * @description Patient only; phone and address exclusively. Null/empty address clears it. Identity, clinical fields, email and references are forbidden. Does not change clinical revision.
         */
        patch: operations["patch_me_profile"];
        trace?: never;
    };
    "/me/doctors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List own linked doctors (patient)
         * @description Newest assignments first with _id tie-breaker. Profile comes exclusively from the session. No notes or account internals.
         */
        get: operations["get_me_doctors"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/patients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List currently assigned patients (doctor)
         * @description Defaults: page=1, limit=20 (maximum 100), sort=-createdAt. Sort supports createdAt, -createdAt, name, -name with _id in the same direction as a stable tie-breaker. search is a normalized, escaped literal prefix of full fields or word tokens. Exact descriptor filters are normalized. from/to are inclusive YYYY-MM-DD creation dates in Asia/Dhaka using IANA timezone rules. Reversed/invalid ranges and unknown parameters are rejected. Missing pages are empty; totalPages=0 for no matches. Session doctor scope applies to records and totals. doctorId, if supplied, further intersects the session scope and cannot impersonate another doctor.
         */
        get: operations["get_me_patients"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/patients/{patientId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read an assigned patient (doctor)
         * @description Current assignment required; outside scope returns 404. page/limit paginate safe linkedDoctors (default 20, maximum 100); linkedDoctorsMeta and linkedDoctorCount describe the full list. No notes in this DTO.
         */
        get: operations["get_me_patients__patientId_"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/patients/{patientId}/clinical": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update shared condition/status (assigned doctor)
         * @description Only condition/status and last-read patient revision. At least one clinical field is required. Empty condition clears it. Increments revision and records the editor/time atomically. Stale revision returns 409. The assignment is guarded by a write inside the transaction, so concurrent unlink/deletion cannot complete a stale authorized update.
         */
        patch: operations["patch_me_patients__patientId__clinical"];
        trace?: never;
    };
    "/me/patients/{patientId}/note": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read own private note (assigned doctor)
         * @description Derives the doctor from the session. An existing assignment without a note returns {note:null,revision:0,updatedAt:null}; after clearing, the revision and timestamp are preserved. Other doctors and patients cannot read it.
         */
        get: operations["get_me_patients__patientId__note"];
        /**
         * Replace own private note (assigned doctor)
         * @description One trimmed note of 1–20000 characters per association. Supply the last-read note revision, distinct from patient clinical revision. Successful writes increment it. Stale revisions return 409; missing assignment returns 404.
         */
        put: operations["put_me_patients__patientId__note"];
        post?: never;
        /**
         * Clear own private note (assigned doctor)
         * @description Requires the last-read note revision in the JSON body. Clears note content but increments/preserves its revision and update timestamp to reject stale writes. Returns 204; GET again to read the new revision. Clearing an already empty note with the current revision succeeds and increments it.
         */
        delete: operations["delete_me_patients__patientId__note"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read the active account’s role-specific dashboard
         * @description Identity comes exclusively from the session. from/to are inclusive Asia/Dhaka YYYY-MM-DD dates. to defaults to today; from defaults to 29 calendar days before to. Maximum 365 inclusive calendar days. Daily buckets through 90 days, monthly afterward; month labels use the first day of the month, with partial boundary months counting only the requested dates. Missing buckets and all five statuses are zero-filled. Totals/statuses describe all current records/assignments regardless of range; trends describe stored records/current assignments, not visits or historical assignment snapshots. Admin totals count each patient once; top ten doctors include zero-patient doctors and tie by ID; use GET /doctors for paginated details. Doctor recent assignments are the latest ten, independent of range. Patient response has own clinical fields and at most ten linked-doctor summaries (latest first); use GET /me/doctors for pagination. Date parameters are validated but do not affect the patient response. No private notes are returned.
         */
        get: operations["getDashboard"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/filters": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Look up permitted filter values (admin/doctor)
         * @description field defaults to condition. Admins may request specialization, hospital, condition or status. Doctors may request condition/status and only values from their currently assigned patients contribute to records or totals. Patients are forbidden. Values and labels use normalized exact-filter keys; absent/empty fields are omitted. Options are deduplicated and sorted ascending, with escaped literal normalized prefix search. Default page=1 and limit=20, maximum limit=100. Totals count permitted matching unique options, never hidden records. No frequency counts are exposed.
         */
        get: operations["getFilterOptions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Public process liveness */
        get: operations["getLiveness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Public bounded database readiness */
        get: operations["getReadiness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/docs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Interactive API explorer (active admin only) */
        get: operations["getInteractiveDocs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/docs/openapi.json": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Download the runtime OpenAPI contract (active admin only) */
        get: operations["getOpenApiContract"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/csrf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Establish a session-bound CSRF token
         * @description Retain the cookie. Supply the token as X-CSRF-Token for every mutation. Login regenerates the session and invalidates the old token; fetch this endpoint again after login. Safe for pending/rejected sessions. Browser Origin or Referer, when supplied, must match FRONTEND_ORIGIN exactly. No credentialed cross-origin CORS is enabled; browser clients use the frontend same-origin proxy.
         */
        get: operations["getCsrfToken"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Submit a pending doctor or patient account
         * @description Does not log in or create a profile. Requires a previously established CSRF session. Only doctor/patient roles and the listed fields are accepted. Ten attempts per IP per fixed one-hour window.
         */
        post: operations["registerAccount"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Authenticate and regenerate the session
         * @description Pending and rejected accounts can log in for status display. Disabled and invalid credentials receive the same generic 401. Eight-hour absolute lifetime; activity never extends it. Fetch /auth/csrf after login. Limits: 30 attempts/IP and 10 attempts/normalized-email+IP per fixed 15-minute window, including successful attempts.
         */
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read current account state
         * @description Loads current database state. Pending/rejected accounts receive status and, for rejected accounts, the optional reason. Active doctor/patient profiles must exist and match the account email. No password hashes or submitted profile details are returned.
         */
        get: operations["getCurrentUser"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Destroy session and clear the matching cookie
         * @description Also permitted for pending, rejected and subsequently disabled session holders. No body or an empty JSON object is accepted.
         */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/registrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List registration submissions (active admin only)
         * @description Default sort: createdAt descending, then _id descending. Includes only public registration submissions, including decided submissions. Does not include submitted profile details.
         */
        get: operations["listRegistrations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/registrations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Review submitted profile details (active admin only) */
        get: operations["getRegistration"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/registrations/{id}/decision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Approve or reject a pending registration (active admin only)
         * @description A decision is final in v1. Approve with mode=create or mode=link and an explicit matching-email, unclaimed profileId. Create uses submitted fields. New patients require patientClinical with condition and status; use an empty condition string to confirm no condition. Doctor decisions reject patientClinical. Linking preserves existing profile data. Approval and profile linkage/creation are atomic. Duplicate or competing decisions return 409. Rejection retains the submission and optional reason.
         */
        put: operations["decideRegistration"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        DoctorCreate: {
            name: string;
            specialization: string;
            hospital: string;
            phone: string;
            /** Format: email */
            email: string;
        };
        DoctorPatch: {
            name?: string;
            specialization?: string;
            hospital?: string;
            phone?: string;
            /** Format: email */
            email?: string;
        };
        PatientCreate: {
            name: string;
            dateOfBirth: string;
            /** @enum {string} */
            gender: "female" | "male" | "other" | "undisclosed";
            phone: string;
            email?: string | null;
            address?: string | null;
            condition?: string;
            /**
             * @default unassessed
             * @enum {string}
             */
            status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
            /** @default [] */
            doctorIds: string[];
        };
        PatientPatch: {
            name?: string;
            dateOfBirth?: string;
            /** @enum {string} */
            gender?: "female" | "male" | "other" | "undisclosed";
            phone?: string;
            email?: string | null;
            address?: string | null;
            condition?: string;
            /** @enum {string} */
            status?: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
            revision?: number;
        };
        ClinicalPatch: {
            condition?: string;
            /** @enum {string} */
            status?: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
            revision: number;
        };
        ContactPatch: {
            phone?: string;
            address?: string | null;
        };
        NotePut: {
            note: string;
            revision: number;
        };
        NoteDelete: {
            revision: number;
        };
        DoctorResponse: {
            data: {
                id: string;
                name: string;
                specialization: string;
                hospital: string;
                phone: string;
                /** Format: email */
                email: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
            };
        };
        PatientResponse: {
            data: {
                id: string;
                name: string;
                /** Format: date */
                dateOfBirth: string;
                age: number;
                /** @enum {string} */
                gender: "female" | "male" | "other" | "undisclosed";
                phone: string;
                /** Format: email */
                email?: string;
                address?: string;
                condition?: string;
                /** @enum {string} */
                status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                revision: number;
                /** Format: date-time */
                lastClinicalUpdateAt?: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
            };
        };
        PatientDetailResponse: {
            data: {
                id: string;
                name: string;
                /** Format: date */
                dateOfBirth: string;
                age: number;
                /** @enum {string} */
                gender: "female" | "male" | "other" | "undisclosed";
                phone: string;
                /** Format: email */
                email?: string;
                address?: string;
                condition?: string;
                /** @enum {string} */
                status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                revision: number;
                /** Format: date-time */
                lastClinicalUpdateAt?: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
                linkedDoctors: {
                    id: string;
                    name: string;
                    specialization: string;
                    hospital: string;
                    phone: string;
                    /** Format: email */
                    email: string;
                    /** Format: date-time */
                    createdAt: string;
                    /** Format: date-time */
                    updatedAt: string;
                }[];
                linkedDoctorCount: number;
                linkedDoctorsMeta: {
                    page: number;
                    limit: number;
                    total: number;
                    totalPages: number;
                };
            };
        };
        DoctorListResponse: {
            data: {
                id: string;
                name: string;
                specialization: string;
                hospital: string;
                phone: string;
                /** Format: email */
                email: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
                patientCount: number;
            }[];
            meta: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
        PatientListResponse: {
            data: {
                id: string;
                name: string;
                /** Format: date */
                dateOfBirth: string;
                age: number;
                /** @enum {string} */
                gender: "female" | "male" | "other" | "undisclosed";
                phone: string;
                /** Format: email */
                email?: string;
                address?: string;
                condition?: string;
                /** @enum {string} */
                status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                revision: number;
                /** Format: date-time */
                lastClinicalUpdateAt?: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
            }[];
            meta: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
        LinkedDoctorListResponse: {
            data: {
                id: string;
                name: string;
                specialization: string;
                hospital: string;
                phone: string;
                /** Format: email */
                email: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
            }[];
            meta: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
        OwnProfileResponse: {
            data: {
                id: string;
                name: string;
                specialization: string;
                hospital: string;
                phone: string;
                /** Format: email */
                email: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
            } | {
                id: string;
                name: string;
                /** Format: date */
                dateOfBirth: string;
                age: number;
                /** @enum {string} */
                gender: "female" | "male" | "other" | "undisclosed";
                phone: string;
                /** Format: email */
                email?: string;
                address?: string;
                condition?: string;
                /** @enum {string} */
                status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                revision: number;
                /** Format: date-time */
                lastClinicalUpdateAt?: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
            };
        };
        NoteResponse: {
            data: {
                note: string | null;
                revision: number;
                updatedAt: string | null;
            };
        };
        NoteListResponse: {
            data: {
                note: string | null;
                revision: number;
                updatedAt: string | null;
                doctor: {
                    id: string;
                    name: string;
                    specialization: string;
                    hospital: string;
                    phone: string;
                    /** Format: email */
                    email: string;
                    /** Format: date-time */
                    createdAt: string;
                    /** Format: date-time */
                    updatedAt: string;
                };
            }[];
            meta: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
        AssignmentResponse: {
            data: {
                doctorId: string;
                patientId: string;
                /** Format: date-time */
                assignedAt: string;
            };
        };
        DashboardResponse: {
            data: {
                /** @constant */
                role: "admin";
                range: {
                    from: string;
                    to: string;
                    /** @constant */
                    timezone: "Asia/Dhaka";
                    /** @enum {string} */
                    interval: "day" | "month";
                };
                totalDoctors: number;
                totalPatients: number;
                patientsPerDoctor: {
                    doctorId: string;
                    name: string;
                    patientCount: number;
                }[];
                doctorCreationTrend: {
                    date: string;
                    count: number;
                }[];
                patientCreationTrend: {
                    date: string;
                    count: number;
                }[];
                patientStatusDistribution: {
                    /** @enum {string} */
                    status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                    count: number;
                }[];
            } | {
                /** @constant */
                role: "doctor";
                range: {
                    from: string;
                    to: string;
                    /** @constant */
                    timezone: "Asia/Dhaka";
                    /** @enum {string} */
                    interval: "day" | "month";
                };
                assignedPatientCount: number;
                patientStatusDistribution: {
                    /** @enum {string} */
                    status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                    count: number;
                }[];
                recentAssignments: {
                    patientId: string;
                    name: string;
                    /** @enum {string} */
                    status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                    /** Format: date-time */
                    assignedAt: string;
                }[];
                assignmentTrend: {
                    date: string;
                    count: number;
                }[];
            } | {
                /** @constant */
                role: "patient";
                patient: {
                    id: string;
                    condition: string | null;
                    /** @enum {string} */
                    status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                    lastClinicalUpdateAt: string | null;
                };
                linkedDoctorCount: number;
                linkedDoctors: {
                    id: string;
                    name: string;
                    specialization: string;
                    hospital: string;
                }[];
            };
        };
        AdminDashboard: {
            /** @constant */
            role: "admin";
            range: {
                from: string;
                to: string;
                /** @constant */
                timezone: "Asia/Dhaka";
                /** @enum {string} */
                interval: "day" | "month";
            };
            totalDoctors: number;
            totalPatients: number;
            patientsPerDoctor: {
                doctorId: string;
                name: string;
                patientCount: number;
            }[];
            doctorCreationTrend: {
                date: string;
                count: number;
            }[];
            patientCreationTrend: {
                date: string;
                count: number;
            }[];
            patientStatusDistribution: {
                /** @enum {string} */
                status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                count: number;
            }[];
        };
        DoctorDashboard: {
            /** @constant */
            role: "doctor";
            range: {
                from: string;
                to: string;
                /** @constant */
                timezone: "Asia/Dhaka";
                /** @enum {string} */
                interval: "day" | "month";
            };
            assignedPatientCount: number;
            patientStatusDistribution: {
                /** @enum {string} */
                status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                count: number;
            }[];
            recentAssignments: {
                patientId: string;
                name: string;
                /** @enum {string} */
                status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                /** Format: date-time */
                assignedAt: string;
            }[];
            assignmentTrend: {
                date: string;
                count: number;
            }[];
        };
        PatientDashboard: {
            /** @constant */
            role: "patient";
            patient: {
                id: string;
                condition: string | null;
                /** @enum {string} */
                status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                lastClinicalUpdateAt: string | null;
            };
            linkedDoctorCount: number;
            linkedDoctors: {
                id: string;
                name: string;
                specialization: string;
                hospital: string;
            }[];
        };
        FilterResponse: {
            data: {
                value: string;
                label: string;
            }[];
            meta: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
        Registration: {
            name: string;
            /** Format: email */
            email: string;
            password: string;
            /** @constant */
            role: "doctor";
            profile: {
                specialization: string;
                hospital: string;
                phone: string;
            };
        } | {
            name: string;
            /** Format: email */
            email: string;
            password: string;
            /** @constant */
            role: "patient";
            profile: {
                dateOfBirth: string;
                /** @enum {string} */
                gender: "female" | "male" | "other" | "undisclosed";
                phone: string;
                address?: string;
            };
        };
        Login: {
            /** Format: email */
            email: string;
            password: string;
        };
        Logout: Record<string, never>;
        CurrentUserResponse: {
            data: {
                id: string;
                name: string;
                /** Format: email */
                email: string;
                /** @enum {string} */
                role: "admin" | "doctor" | "patient";
                /** @enum {string} */
                status: "pending" | "active" | "rejected" | "disabled";
                profileId: string | null;
                rejectionReason?: string;
            };
        };
        CsrfResponse: {
            data: {
                csrfToken: string;
            };
        };
        RegistrationDecision: {
            /** @constant */
            decision: "reject";
            reason?: string;
        } | {
            /** @constant */
            decision: "approve";
            /** @constant */
            mode: "link";
            profileId: string;
        } | {
            /** @constant */
            decision: "approve";
            /** @constant */
            mode: "create";
            patientClinical?: {
                condition: string;
                /** @enum {string} */
                status: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
            };
        };
        RegistrationListResponse: {
            data: {
                id: string;
                name: string;
                /** Format: email */
                email: string;
                /** @enum {string} */
                role: "doctor" | "patient";
                /** @enum {string} */
                status: "pending" | "active" | "rejected" | "disabled";
                profileId: string | null;
                rejectionReason?: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
            }[];
            meta: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
        RegistrationDetailResponse: {
            data: {
                id: string;
                name: string;
                /** Format: email */
                email: string;
                /** @constant */
                role: "doctor";
                /** @enum {string} */
                status: "pending" | "active" | "rejected" | "disabled";
                profileId: string | null;
                rejectionReason?: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
                profile: {
                    specialization: string;
                    hospital: string;
                    phone: string;
                };
            } | {
                id: string;
                name: string;
                /** Format: email */
                email: string;
                /** @constant */
                role: "patient";
                /** @enum {string} */
                status: "pending" | "active" | "rejected" | "disabled";
                profileId: string | null;
                rejectionReason?: string;
                /** Format: date-time */
                createdAt: string;
                /** Format: date-time */
                updatedAt: string;
                profile: {
                    dateOfBirth: string;
                    /** @enum {string} */
                    gender: "female" | "male" | "other" | "undisclosed";
                    phone: string;
                    address?: string;
                };
            };
        };
        Error: {
            error: {
                code: string;
                message: string;
                /** Format: uuid */
                requestId: string;
                fieldErrors?: {
                    [key: string]: string[];
                };
            };
        };
        LivenessResponse: {
            data: {
                /** @constant */
                status: "alive";
            };
        };
        ReadinessResponse: {
            data: {
                /** @constant */
                status: "ready";
            };
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    get_doctors: {
        parameters: {
            query?: {
                page?: string;
                limit?: string;
                search?: string;
                sort?: "createdAt" | "-createdAt" | "name" | "-name";
                from?: string;
                to?: string;
                specialization?: string;
                hospital?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DoctorListResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post_doctors: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "name": "Dr Example",
                 *       "email": "doctor@example.test",
                 *       "specialization": "Cardiology",
                 *       "hospital": "Example Hospital",
                 *       "phone": "+8801700000000"
                 *     }
                 */
                "application/json": components["schemas"]["DoctorCreate"];
            };
        };
        responses: {
            /** @description Successful response; private, no-store */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DoctorResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get_doctors__id_: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DoctorResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch_doctors__id_: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DoctorPatch"];
            };
        };
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DoctorResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get_patients: {
        parameters: {
            query?: {
                page?: string;
                limit?: string;
                search?: string;
                sort?: "createdAt" | "-createdAt" | "name" | "-name";
                from?: string;
                to?: string;
                condition?: string;
                status?: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                doctorId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientListResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    post_patients: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "name": "Example Patient",
                 *       "dateOfBirth": "1995-02-28",
                 *       "gender": "undisclosed",
                 *       "phone": "+8801800000000",
                 *       "condition": "Routine observation",
                 *       "status": "unassessed",
                 *       "doctorIds": []
                 *     }
                 */
                "application/json": components["schemas"]["PatientCreate"];
            };
        };
        responses: {
            /** @description Successful response; private, no-store */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get_patients__id_: {
        parameters: {
            query?: {
                page?: string;
                limit?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientDetailResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    delete_patients__id_: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success; empty body */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch_patients__id_: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PatientPatch"];
            };
        };
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get_doctors__doctorId__patients: {
        parameters: {
            query?: {
                page?: string;
                limit?: string;
                search?: string;
                sort?: "createdAt" | "-createdAt" | "name" | "-name";
                from?: string;
                to?: string;
                condition?: string;
                status?: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                doctorId?: string;
            };
            header?: never;
            path: {
                doctorId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientListResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    put_doctors__doctorId__patients__patientId_: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                doctorId: string;
                patientId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssignmentResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    delete_doctors__doctorId__patients__patientId_: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                doctorId: string;
                patientId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success; empty body */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get_patients__patientId__doctor_notes: {
        parameters: {
            query?: {
                page?: string;
                limit?: string;
            };
            header?: never;
            path: {
                patientId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NoteListResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get_me_profile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnProfileResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch_me_profile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "phone": "+8801800000000",
                 *       "address": "Synthetic address"
                 *     }
                 */
                "application/json": components["schemas"]["ContactPatch"];
            };
        };
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get_me_doctors: {
        parameters: {
            query?: {
                page?: string;
                limit?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LinkedDoctorListResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get_me_patients: {
        parameters: {
            query?: {
                page?: string;
                limit?: string;
                search?: string;
                sort?: "createdAt" | "-createdAt" | "name" | "-name";
                from?: string;
                to?: string;
                condition?: string;
                status?: "unassessed" | "under_treatment" | "stable" | "critical" | "recovered";
                doctorId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientListResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get_me_patients__patientId_: {
        parameters: {
            query?: {
                page?: string;
                limit?: string;
            };
            header?: never;
            path: {
                patientId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientDetailResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patch_me_patients__patientId__clinical: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                patientId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "condition": "Routine observation",
                 *       "status": "stable",
                 *       "revision": 0
                 *     }
                 */
                "application/json": components["schemas"]["ClinicalPatch"];
            };
        };
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    get_me_patients__patientId__note: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                patientId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NoteResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    put_me_patients__patientId__note: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                patientId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "note": "Synthetic clinical note",
                 *       "revision": 0
                 *     }
                 */
                "application/json": components["schemas"]["NotePut"];
            };
        };
        responses: {
            /** @description Successful response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NoteResponse"];
                };
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    delete_me_patients__patientId__note: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                patientId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "revision": 1
                 *     }
                 */
                "application/json": components["schemas"]["NoteDelete"];
            };
        };
        responses: {
            /** @description Success; empty body */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid identifier, body or query; unsupported fields are rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication is required or has expired */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Forbidden role, inactive account, missing profile, invalid CSRF token or browser origin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Profile or assignment not found; doctors receive 404 outside their scope */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, duplicate email or attempted linked-profile email change */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDashboard: {
        parameters: {
            query?: {
                from?: string;
                to?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful role-scoped response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DashboardResponse"];
                };
            };
            /** @description Invalid query, unknown parameter or date range */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Inactive account, unavailable profile or unsupported role/filter */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getFilterOptions: {
        parameters: {
            query?: {
                page?: string;
                limit?: string;
                field?: "specialization" | "hospital" | "condition" | "status";
                search?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful role-scoped response; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FilterResponse"];
                };
            };
            /** @description Invalid query, unknown parameter or date range */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Inactive account, unavailable profile or unsupported role/filter */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getLiveness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Process is alive */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LivenessResponse"];
                };
            };
        };
    };
    getReadiness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Database ping succeeded */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadinessResponse"];
                };
            };
            /** @description Database unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getInteractiveDocs: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Admin-only documentation; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/html": string;
                };
            };
            /** @description Invalid body, query or identifier */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Missing, expired or invalid authentication */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid CSRF token/origin, forbidden role/status or unavailable profile */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getOpenApiContract: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OpenAPI 3.1 document; same content as the repository artifact */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
            /** @description Invalid body, query or identifier */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Missing, expired or invalid authentication */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid CSRF token/origin, forbidden role/status or unavailable profile */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCsrfToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Session-bound token; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CsrfResponse"];
                };
            };
            /** @description Invalid body, query or identifier */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Missing, expired or invalid authentication */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid CSRF token/origin, forbidden role/status or unavailable profile */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    registerAccount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Registration"];
            };
        };
        responses: {
            /** @description Pending account */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CurrentUserResponse"];
                };
            };
            /** @description Invalid body, query or identifier */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Missing, expired or invalid authentication */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid CSRF token/origin, forbidden role/status or unavailable profile */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Email is already in use */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Too many attempts */
            429: {
                headers: {
                    /** @description Seconds until the next fixed window */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Login"];
            };
        };
        responses: {
            /** @description Current account and regenerated session cookie */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CurrentUserResponse"];
                };
            };
            /** @description Invalid body, query or identifier */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Missing, expired or invalid authentication */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid CSRF token/origin, forbidden role/status or unavailable profile */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Too many attempts */
            429: {
                headers: {
                    /** @description Seconds until the next fixed window */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCurrentUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current user; private, no-store */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CurrentUserResponse"];
                };
            };
            /** @description Invalid body, query or identifier */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Missing, expired or invalid authentication */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid CSRF token/origin, forbidden role/status or unavailable profile */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Logout"];
            };
        };
        responses: {
            /** @description Session destroyed; empty body and expired cookie */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid body, query or identifier */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Missing, expired or invalid authentication */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid CSRF token/origin, forbidden role/status or unavailable profile */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listRegistrations: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                status?: "pending" | "active" | "rejected" | "disabled";
                role?: "doctor" | "patient";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated registration summaries */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegistrationListResponse"];
                };
            };
            /** @description Invalid body, query or identifier */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Missing, expired or invalid authentication */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid CSRF token/origin, forbidden role/status or unavailable profile */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getRegistration: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Registration with submitted profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegistrationDetailResponse"];
                };
            };
            /** @description Invalid body, query or identifier */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Missing, expired or invalid authentication */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid CSRF token/origin, forbidden role/status or unavailable profile */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Registration not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    decideRegistration: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegistrationDecision"];
            };
        };
        responses: {
            /** @description Decided registration */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegistrationDetailResponse"];
                };
            };
            /** @description Invalid body, query or identifier */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Missing, expired or invalid authentication */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid CSRF token/origin, forbidden role/status or unavailable profile */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Registration not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Registration already decided, profile mismatches/is claimed or a matching profile already exists */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Request exceeds 32 KiB */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported request encoding or charset */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
}

# MLRIT Project Hub — Standalone Backend Blueprint

> **Authoritative backend design.** Stack target: **Node.js + Express (or NestJS) · PostgreSQL · JWT · REST**.
> Supabase is treated as a **placeholder only** — no Supabase code, migrations, RLS, Storage, or Realtime are part of this design.
> **This is a blueprint. No backend code is written yet.** Frontend analysis it builds on: see `ARCHITECTURE_AND_BACKEND_PLAN.md` Phases 1–2 & 4.

---

## 0. Design principles

1. **Server is the only authority.** The frontend's `RoleGate`/`localStorage` role is cosmetic; every rule (roles, ownership, section scoping, workflow transitions) is enforced server-side. This replaces the role Supabase-RLS would have played.
2. **Relational-correct schema.** Array columns the current Supabase design used (`sections.student_mentor_ids`, `timetable.student_mentor_ids`) are normalized into **join tables**. This also fixes a latent bug where the UI wrote mentors onto the section row but read them from a separate `mentor_assignments` lookup.
3. **Thin controllers, fat services.** Controllers parse/validate/respond; services hold business logic; repositories/ORM own data access. Keeps the workflow engine and notification fan-out testable.
4. **Stateless API + JWT.** Horizontal-scalable; refresh tokens are the only server-side auth state.
5. **Feature parity first.** Every existing frontend capability maps to a concrete endpoint (§6). Nothing the UI does today is dropped.
6. **Storage & realtime are swappable.** File storage sits behind a `StorageProvider` interface (local disk → S3 later); realtime behind a `NotificationTransport` (WebSocket primary, SSE/polling fallback).

---

## 1. Business requirements extracted from the frontend

Derived from the 16 pages, 4 dashboards, 5 data hooks, `FileUpload`, and `AuthContext`.

### Roles
`admin`, `faculty`, `student_mentor`, `student`. Role is **inferred from email at signup** (`admin`/`faculty`/`mentor` substrings → else `student`) and **overridable by an admin** thereafter. New accounts require **admin approval** before accessing protected routes.

### Capability matrix

| Capability | student | student_mentor | faculty | admin |
|---|:--:|:--:|:--:|:--:|
| View own dashboard | ✅ | ✅ | ✅ | ✅ |
| Edit own team's project (while Draft) + upload files | ✅ | — | — | — |
| View own team & teammates | ✅ | — | — | — |
| Create teams in assigned section | — | ✅ | — | — |
| Review/advance projects in assigned sections | — | ✅ | ✅ | ✅ |
| Add mentor feedback to project | — | ✅ | ✅ | ✅ |
| Submit weekly updates | — | ✅ | ✅ | — |
| View sections (assigned) | — | ✅ | ✅ | ✅(all) |
| Manage sections (CRUD + assign mentors) | — | — | — | ✅ |
| Manage mentors (CRUD + bulk CSV import) | — | — | — | ✅ |
| Approve/reject pending users | — | — | — | ✅ |
| Mark mentor/faculty attendance | — | — | — | ✅ |
| Manage timetable (CRUD) | — | — | — | ✅ |
| View timetable (scoped) | ✅ | ✅ | ✅ | ✅ |
| Create announcements | — | ✅ | ✅ | ✅ |
| Delete announcements | — | — | — | ✅ |
| View announcements | ✅(all only) | ✅ | ✅ | ✅ |
| Read own notifications (realtime) | ✅ | ✅ | ✅ | ✅ |
| View admin analytics (KPIs/charts) | — | — | — | ✅ |
| View public project archive | ✅ (also anonymous) | ✅ | ✅ | ✅ |
| Export to Excel | varies | ✅ | — | ✅ |

### Core business rules
- **One project per team**; a default `Untitled Project` (status `Draft`) is created when a team is formed.
- **Project workflow** is a strict, mostly-linear state machine (§7).
- **Section staffing:** 1 faculty mentor + 3–4 student mentors per section (UI-enforced today; must be server-enforced).
- **Announcements** target `all` or `mentors_only`; students never see `mentors_only`.
- **Weekly updates:** at most one per user per ISO week (`upsert` on user+week).
- **Attendance:** at most one record per user per date.
- **Files:** ≤ 20 MB; extensions `pdf, ppt, pptx, doc, docx, png, jpg, jpeg`; three kinds per project (`ppt`, `report`, `yukthi`).
- **OAuth domain restriction:** only `@mlrit.ac.in` accounts (today Google-only; keep as a rule).

---

## 2. Domain entities & relationships

### Entities
`User`, `Section`, `SectionMentor` (join), `Team`, `TeamMember` (join), `Project`, `ProjectStatusHistory`, `File`, `Announcement`, `Attendance`, `Timetable`, `TimetableMentor` (join), `WeeklyUpdate`, `Notification`, `RefreshToken`.

### Relationship summary (ERD in text)
```
User (student)        N───1  Section            (a student belongs to one section)
Section               1───N  Team
Team                  1───N  TeamMember  N───1  User (students)
Team                  1───1  Project            (default project per team)
Project               N───1  Team / Section / User(mentor)
Project               1───N  ProjectStatusHistory  N───1 User (changed_by)
Project               1───3  File (ppt/report/yukthi)   File N───1 Team, N───1 User(uploaded_by)
Section               N───N  User    via SectionMentor (role_in_section: faculty|student_mentor)
Timetable             N───1  Section,  N───1 User(faculty)
Timetable             N───N  User    via TimetableMentor (student mentors on a slot)
Announcement          N───1  User (author)
Attendance            N───1  User (subject),  N───1 User (marked_by)
WeeklyUpdate          N───1  User
Notification          N───1  User
RefreshToken          N───1  User
```

**Why join tables instead of arrays:** `SectionMentor` replaces both `faculty_mentor_id` and `student_mentor_ids[]`; `TimetableMentor` replaces `timetable.student_mentor_ids[]`. This makes "sections a mentor is assigned to" a simple indexed query (powering `useMentor`, `useProjects`, dashboards) and removes the write-here/read-there inconsistency in today's code.

---

## 3. Database schema (PostgreSQL — design spec)

> Presented as a design spec (columns/types/constraints). Concrete DDL or a Prisma schema is produced during implementation, not here.

**enums:** `user_role(admin|faculty|student_mentor|student)`, `project_status(Draft|Student Mentor Review|Faculty Review|Approved|Submitted to CIE|Completed)`, `attendance_status(present|absent|late)`, `notification_type(announcement|project_status|project_feedback|team_assignment|mentor_assignment|deadline)`, `target_audience(all|mentors_only)`, `section_mentor_role(faculty|student_mentor)`.

**users** — `id PK`, `name`, `email UNIQUE`, `password_hash` (nullable for OAuth-only), `role user_role` default `student`, `approved bool` default `false`, `section_id FK→sections NULL`, `department`, `roll_number`, `phone`, `github_link`, `linkedin_link`, `avatar`, `google_sub` (OAuth subject, nullable, unique), `created_at`, `updated_at`. Indexes: `email`, `role`, `section_id`.

**sections** — `id PK`, `name`, `department` default `CSE`, `year int`, `academic_year`, `semester`, `student_count int` default 0, `created_at`, `updated_at`.

**section_mentors** — `section_id FK`, `user_id FK`, `role_in_section section_mentor_role`, `created_at`. PK `(section_id, user_id)`. Index `user_id`. (Optional rule: at most one `faculty` row per section.)

**teams** — `id PK`, `name`, `section_id FK→sections CASCADE`, `lead_id FK→users NULL`, `created_by FK→users NULL`, `created_at`, `updated_at`. Index `section_id`.

**team_members** — `team_id FK CASCADE`, `student_id FK→users CASCADE`, `created_at`. PK `(team_id, student_id)`. Index `student_id`. (Optionally enforce a student belongs to one team per academic year.)

**projects** — `id PK`, `title` default `Untitled Project`, `domain`, `abstract`, `github_link`, `video_link`, `ppt_file_id FK→files NULL`, `report_file_id`, `yukthi_file_id`, `feedback`, `deadline timestamptz`, `status project_status` default `Draft`, `team_id FK→teams`, `section_id FK→sections`, `mentor_id FK→users NULL`, `academic_year`, `created_at`, `updated_at`. Indexes: `team_id`, `section_id`, `status`.

**project_status_history** — `id PK`, `project_id FK CASCADE`, `from_status`, `to_status`, `changed_by FK→users`, `note`, `changed_at`.

**files** — `id PK` (uuid), `team_id FK→teams NULL`, `kind (ppt|report|yukthi|other)`, `original_name`, `storage_key` (path/object key), `mime_type`, `size_bytes`, `uploaded_by FK→users`, `created_at`. Index `team_id`.

**announcements** — `id PK`, `title`, `content`, `author_id FK→users CASCADE`, `target_audience` default `all`, `created_at`, `updated_at`.

**attendance** — `id PK`, `user_id FK CASCADE`, `attendance_date date`, `status attendance_status`, `notes`, `marked_by FK→users NULL`, `marked_at`. UNIQUE `(user_id, attendance_date)`.

**timetable** — `id PK`, `section_id FK CASCADE`, `day_of_week (Monday..Saturday)`, `start_time time`, `end_time time`, `subject`, `room_number`, `faculty_id FK→users NULL`, `created_at`, `updated_at`. Indexes `section_id`, `faculty_id`.

**timetable_mentors** — `timetable_id FK CASCADE`, `user_id FK→users CASCADE`. PK `(timetable_id, user_id)`.

**weekly_updates** — `id PK`, `user_id FK CASCADE`, `week_starting date`, `content`, `created_at`, `updated_at`. UNIQUE `(user_id, week_starting)`.

**notifications** — `id PK`, `user_id FK CASCADE`, `type notification_type`, `title`, `message`, `link`, `read_at timestamptz NULL`, `created_at`. Index `(user_id, created_at desc)`.

**refresh_tokens** — `id PK`, `user_id FK CASCADE`, `token_hash`, `user_agent`, `expires_at`, `revoked_at NULL`, `created_at`. Index `user_id`.

**Auto-`updated_at`:** via ORM hook or a shared trigger (implementation detail).

---

## 4. Authentication design (JWT)

### Token strategy
- **Access token (JWT, ~15 min):** signed (HS256 or RS256), claims `{ sub: userId, role, approved }`. Sent as `Authorization: Bearer`. Verified per request by `requireAuth`.
- **Refresh token (~7–30 days):** opaque random string, **stored hashed** in `refresh_tokens`, delivered as an **httpOnly, Secure, SameSite=Strict cookie**. Rotated on every refresh (old one revoked) to detect reuse.
- **Logout:** revoke the presented refresh token (and optionally all of the user's tokens).
- Password hashing: **argon2id** (preferred) or bcrypt (cost ≥ 12). Never store plaintext (the placeholder schema's `password` column is abandoned).

### Flows → endpoints
| Flow | Endpoint | Notes |
|---|---|---|
| Register | `POST /api/auth/register` | Validate `@mlrit.ac.in`; infer default role from email; `approved=false`; hash password; issue tokens **or** return "pending approval" (see open Q). Maps to `AuthContext.register`. |
| Login | `POST /api/auth/login` | Verify password; reject if `!approved` (or allow with limited scope → pending screen); issue access+refresh. Maps to `AuthContext.login`. |
| Google OAuth | `POST /api/auth/google` | Client sends Google ID token; server verifies signature + `hd/email` domain = `mlrit.ac.in`; find-or-create user by `google_sub`/email; issue tokens. Maps to `loginWithGoogle`/`completeGoogleLogin`. |
| Refresh | `POST /api/auth/refresh` | Reads refresh cookie; rotates; returns new access token. |
| Logout | `POST /api/auth/logout` | Revoke refresh token; clear cookie. Maps to `AuthContext.logout`. |
| Current user | `GET /api/auth/me` | Returns profile; frontend replaces its `localStorage('user')` bootstrap with this. |

### Approval gate
A `requireApproved` middleware blocks protected routes when `approved=false`, mirroring the frontend `PendingApprovalScreen`. Admin approval flips the flag (§6).

---

## 5. Authorization design (RBAC + resource scoping)

Replaces Supabase RLS entirely. Two layers:

**Layer 1 — coarse RBAC middleware:** `requireRole(['admin', ...])` on routes (mirrors `RoleGate`).

**Layer 2 — resource scoping in services** (the part RLS used to do):
- **Project read/update:** a *student* may touch only their own team's project, and may edit content **only while `Draft`**; *student_mentor/faculty* only within sections they're assigned to (via `section_mentors`); *admin* unrestricted.
- **Project status transitions:** allowed transitions are role-gated (§7) and validated server-side; the API is the *only* writer of `status`.
- **Sections/Mentors/Timetable/Attendance writes:** admin only; reads scoped by assignment for mentors.
- **Teams:** student reads own; student_mentor creates/reads within assigned sections; admin all.
- **Weekly updates:** author-only writes; admin reads all.
- **Notifications:** strictly own rows.
- **Announcements:** `mentors_only` filtered out for students at the query layer.

A `scopeToAssignedSections(user)` helper returns the section-id set for mentors and is reused across services.

---

## 6. REST API specification

Base path `/api`. All protected endpoints require `requireAuth` + `requireApproved` unless noted. "Roles" = who may call.

### Auth & profile
| Method | Path | Roles | Purpose / frontend source |
|---|---|---|---|
| POST | `/auth/register` | public | Sign up (`SignUp.tsx`) |
| POST | `/auth/login` | public | Email/password login (`Login.tsx`) |
| POST | `/auth/google` | public | Google OAuth exchange (`AuthCallback.tsx`) |
| POST | `/auth/refresh` | cookie | Rotate access token |
| POST | `/auth/logout` | auth | Logout |
| GET | `/auth/me` | auth | Bootstrap current user |
| PATCH | `/users/me` | auth | Update own profile: name,email,phone,github,linkedin (`Profile.tsx`, `updateProfile`) |
| GET | `/users/me/mentor-summary` | faculty, student_mentor | Assigned sections, team count, pending-review count (`Profile.tsx`) |

### Users / mentors (admin)
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/users?role=faculty,student_mentor` | admin, mentors(read) | List mentors (`Mentors.tsx`, `useAdmin.fetchMentors`) |
| POST | `/users` | admin | Create mentor profile (`Mentors.tsx`) |
| PATCH | `/users/:id` | admin | Edit user |
| DELETE | `/users/:id` | admin | Remove user |
| POST | `/users/import` | admin | Bulk CSV mentor import (`Mentors.tsx`) |
| PATCH | `/users/:id/role` | admin | **Role override** |
| GET | `/users/pending` | admin | Pending approvals (`useAdmin.fetchPendingUsers`, `PendingApprovalsPanel`) |
| POST | `/users/:id/approve` | admin | Approve (`useAdmin.approveUser`) |
| POST | `/users/:id/reject` | admin | Reject/delete profile (`useAdmin.rejectUser`) |

### Sections
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/sections` | admin, mentors | List (with expanded mentors) (`Sections.tsx`, `useAdmin.fetchSections`) |
| GET | `/sections/mine` | faculty, student_mentor | My assigned sections (`useMentor.fetchAssignedSections`) |
| POST | `/sections` | admin | Create (`useAdmin.addSection`) |
| PATCH | `/sections/:id` | admin | Update (`useAdmin.updateSection`) |
| DELETE | `/sections/:id` | admin | Delete (`useAdmin.deleteSection`) |
| PUT | `/sections/:id/mentors` | admin | Assign 1 faculty + 3–4 student mentors (`useAdmin.assignMentors`) |
| GET | `/sections/:id/teams` | admin, assigned mentors | Teams + project + members (`useMentor.fetchSectionData`) |
| GET | `/sections/:id/students` | admin, assigned mentors | Students + `unassigned` flag (`useMentor.fetchSectionData`) |

### Teams
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/teams?sectionId=` | admin | All teams / filter (`Teams.tsx` AdminView) |
| GET | `/teams/mine` | student | Own team + members (`Teams.tsx`, `StudentDashboard`) |
| POST | `/teams` | student_mentor | **Transactional**: create team + members + default project (`useMentor.createTeam`) |
| GET | `/teams/:id` | admin, assigned mentors, members | Team detail |

### Projects
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/projects` | all (role-scoped) | List scoped by role (`useProjects.fetchProjects`) |
| GET | `/projects/:id` | scoped | Detail |
| PATCH | `/projects/:id` | student(own,Draft), mentors, admin | Update content/links/feedback/file refs (`useProjects.updateProject`) |
| PATCH | `/projects/:id/status` | role-gated by transition | **Workflow transition** (§7) — appends history + emits notification |
| GET | `/projects/archive` | **public** | Approved/Completed only (`Archive.tsx`, replaces `get_archived_projects`) |

### Announcements
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/announcements` | auth (students: `all` only) | List (`useAnnouncements`) |
| POST | `/announcements` | admin, faculty, student_mentor | Create |
| DELETE | `/announcements/:id` | admin | Delete |

### Attendance (admin)
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/attendance?from=&to=` | admin | Records for range (last 30 days export) (`Attendance.tsx`) |
| PUT | `/attendance` | admin | Upsert one/many by (user, date) |

### Timetable
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/timetable?scope=` | all (scoped) | Slots; `scope=today` for dashboards (`Timetable.tsx`, Faculty/Mentor dashboards) |
| POST | `/timetable` | admin | Create slot (+ mentors) |
| PATCH | `/timetable/:id` | admin | Update |
| DELETE | `/timetable/:id` | admin | Delete |

### Weekly updates
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/weekly-updates?scope=` | faculty/student_mentor(own), admin(all) | List (`WeeklyUpdates.tsx`) |
| PUT | `/weekly-updates` | faculty, student_mentor | Upsert by (user, week) |
| DELETE | `/weekly-updates/:id` | author, admin | Delete |

### Notifications
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/notifications` | auth | Own, paginated (`useNotifications`) |
| PATCH | `/notifications/:id/read` | owner | Mark read |
| PATCH | `/notifications/read-all` | owner | Mark all read |
| WS | `/ws` (or `/notifications/stream` SSE) | auth | Realtime push (replaces Supabase Realtime) |

### Files
| Method | Path | Roles | Purpose |
|---|---|---|---|
| POST | `/files` | student(own team), mentors | Multipart upload (`kind`, `teamId`) → `{id, url}` (`FileUpload.tsx`) |
| GET | `/files/:id` | authorized | Stream/redirect to (signed) download |
| DELETE | `/files/:id` | uploader, mentors, admin | Remove |

### Admin analytics (replaces client-side aggregation)
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/admin/stats` | admin | KPI counts (`useAdmin.fetchStats`) |
| GET | `/admin/section-project-stats` | admin | Status-by-section chart (`fetchSectionProjectStats`) |
| GET | `/admin/domain-popularity` | admin | Domain distribution (`fetchDomainPopularity`) |
| GET | `/admin/mentor-workload` | admin | Top-N mentor loads (`fetchMentorWorkload`) |

**Conventions:** JSON everywhere except `/files` (multipart). List endpoints support `?page=&limit=` (archive uses 12/page). Standard error envelope `{ error: { code, message, details? } }`. camelCase in API responses (frontend uses camelCase types); the data layer maps snake_case DB ↔ camelCase API.

---

## 7. Project status workflow (state machine)

States: `Draft → Student Mentor Review → Faculty Review → Approved → Submitted to CIE → Completed`.

| From | To | Who triggers |
|---|---|---|
| Draft | Student Mentor Review | student (submits) |
| Student Mentor Review | Faculty Review | student_mentor (approve) |
| Student Mentor Review | Draft | student_mentor (send back + feedback) |
| Faculty Review | Approved | faculty (approve) |
| Faculty Review | Student Mentor Review / Draft | faculty (send back + feedback) |
| Approved | Submitted to CIE | admin/faculty |
| Submitted to CIE | Completed | admin |

Rules: server validates `(from,to)` is legal **and** the caller's role is permitted; writes `project_status_history`; emits a `project_status` (and `project_feedback` when feedback added) notification to the relevant users. Content edits (`PATCH /projects/:id`) are blocked once status ≠ `Draft` for students. *(Exact "send-back" paths to confirm — see open questions.)*

---

## 8. Middleware architecture (Express request pipeline)

```
helmet  →  cors(allowlist, credentials)  →  json/urlencoded body parser
  →  cookie parser  →  request-id + structured logger (pino/morgan)
  →  rate limiter (tighter on /auth)
  →  [route] requireAuth → requireApproved → requireRole([...]) → validate(schema)
  →  controller → service → repository/ORM
  →  centralized error handler  →  404 handler
```

- **requireAuth** — verify JWT, attach `req.user`.
- **requireApproved** — 403 + `PENDING_APPROVAL` code if not approved.
- **requireRole(roles)** — coarse RBAC.
- **validate(schema)** — **zod** schemas (reuse/port the frontend's zod where possible) for body/params/query.
- **errorHandler** — maps domain errors → HTTP (e.g. `ForbiddenError`→403, `NotFoundError`→404, `ValidationError`→422) with the standard envelope; logs with request id.
- **upload** — `multer` (memory or temp), wired only on `/files`.
- Security: helmet headers, CORS allowlist with credentials (for refresh cookie), per-route rate limits, payload size caps.

---

## 9. File upload architecture

- **Transport:** `multipart/form-data` via `multer`. Fields: `file`, `kind` (`ppt|report|yukthi`), `teamId`.
- **Validation:** extension whitelist (`pdf,ppt,pptx,doc,docx,png,jpg,jpeg`), MIME sniffing, ≤ 20 MB (mirrors `FileUpload.tsx`).
- **Storage abstraction — `StorageProvider`:**
  - `LocalDiskProvider` (dev): writes under `var/uploads/{teamId}/{kind}/{uuid}_{safeName}`.
  - `S3Provider` (prod): S3/MinIO; downloads via **pre-signed URLs** (replacing Supabase signed URLs, 1 h expiry).
- **Metadata** persisted in `files`; `projects.{ppt,report,yukthi}_file_id` reference rows. Replacing a file deletes the previous object (best-effort, as today).
- **Access control:** upload/download/delete authorized against team membership / section mentorship / admin. Downloads either stream through the API (auth-checked) or redirect to a short-lived signed URL.
- **Frontend impact:** `FileUpload.tsx` switches from `supabase.storage` calls to `POST /api/files` + using returned URL; props/behavior unchanged.

---

## 10. Notification architecture

- **Persistence:** `notifications` table; `GET /api/notifications` (paginated, 30/page as today), `PATCH /:id/read`, `PATCH /read-all`.
- **Emission (server-side `NotificationService.emit(userId, {type,title,message,link})`):** called by workflow transitions, mentor/team assignment, announcement creation (`mentors_only` → mentors; `all` → broad), and a scheduled **deadline** reminder job (cron/worker).
- **Realtime transport (replaces Supabase Realtime):**
  - **Primary:** WebSocket (`socket.io` or `ws`) at `/ws`, authenticated by access token, one **room per user**; `emit()` inserts the row then pushes to that room. Frontend `useNotifications` swaps its `supabase.channel(...)` subscription for a socket listener — same state-update logic (INSERT prepend, UPDATE replace).
  - **Fallback:** SSE (`GET /notifications/stream`) or short polling if WS is unavailable.
- **Scaling note:** for multi-instance deployments, back the WS layer with a Redis pub/sub adapter so emits reach the socket holding the user's connection.

---

## 11. Backend project structure

**Recommended — Express + TypeScript (layered):**
```
server/
├── src/
│   ├── app.ts                 # express app + middleware pipeline
│   ├── server.ts              # http + websocket bootstrap
│   ├── config/                # env loading & validation (zod), constants
│   ├── db/                    # ORM client (Prisma recommended) + migrations
│   ├── middleware/            # requireAuth, requireRole, requireApproved, validate, errorHandler, upload
│   ├── modules/               # feature-first
│   │   ├── auth/              # controller, service, routes, schemas
│   │   ├── users/  sections/  teams/  projects/  announcements/
│   │   ├── attendance/  timetable/  weeklyUpdates/  notifications/  files/  admin/
│   ├── services/              # cross-cutting: StorageProvider, NotificationService, EmailService
│   ├── lib/                   # jwt, hashing, mappers (snake↔camel), errors
│   ├── jobs/                  # deadline-reminder cron
│   └── types/
├── tests/
├── .env.example
└── package.json
```
Each module: `routes.ts → controller.ts → service.ts → schema.ts (zod)`. ORM: **Prisma** (type-safe, easy migrations) — Knex/TypeORM acceptable alternatives.

**Alternative — NestJS:** same boundaries as first-class citizens — modules, controllers, providers (services), `@nestjs/passport` JWT strategy, guards (`RolesGuard`, `ApprovedGuard`), `class-validator` DTOs, `@nestjs/websockets` gateway. More structure/boilerplate; pick if the team prefers convention-heavy or expects significant growth.

---

## 12. Cross-cutting concerns

- **Validation:** zod at the edge (port frontend schemas) + DB constraints (enums, unique, FKs) as the backstop.
- **Error handling:** typed domain errors → HTTP envelope; never leak stack traces in prod.
- **Logging:** structured (pino) with request ids; audit log for sensitive admin actions (approve/reject, role change, deletes).
- **Config/env:** `.env` validated on boot — `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `STORAGE_DRIVER`, `S3_*`, `CORS_ORIGINS`, `PORT(3001)`. Frontend adds `VITE_API_URL`.
- **Security:** argon2 hashing, httpOnly refresh cookie, helmet, CORS allowlist, rate limiting, input validation, parameterized queries (ORM), domain restriction on signup, least-privilege DB user.
- **Pagination/sorting:** consistent `page/limit`, default sorts (e.g. `updated_at desc`).
- **Testing:** unit (services, workflow state machine, authz helpers) + integration (supertest against a test DB) + contract checks so responses match frontend types.

---

## 13. Frontend integration plan (later phase — no changes now)

The frontend currently calls Supabase directly in `lib/supabase.ts`, the 5 hooks, `FileUpload`, and `AuthContext`. Migration approach when we implement:
1. Introduce `lib/api.ts` — a typed `fetch` client (base `VITE_API_URL`, attaches access token, handles 401→refresh).
2. Re-point each hook's body to the REST endpoints in §6 **without changing the hook's public signature**, so pages/components stay untouched (preserves functionality).
3. Replace `AuthContext` Supabase calls with `/auth/*`; replace `localStorage('user')` bootstrap with `GET /auth/me`.
4. Swap `FileUpload` storage calls for `/files`; swap `useNotifications` realtime channel for the WS client.
5. Remove `@supabase/supabase-js` once parity is verified.

Mapping table (current → target) is the §6 "frontend source" column.

---

## 14. Implementation roadmap

| Phase | Deliverable | Notes |
|---|---|---|
| **0. Scaffold** | `server/` (Express+TS), config/env validation, DB connection, ORM, health check, CI lint/test | Foundation |
| **1. Data layer** | Prisma schema for all entities (§3) + migrations + seed | The schema spec realized |
| **2. Auth** | register/login/google/refresh/logout/me, hashing, JWT, refresh rotation, approval gate, `requireAuth/Approved/Role` | Unblocks everything |
| **3. Core domain** | users/mentors, sections (+mentor assignment), teams (transactional create), projects CRUD | Bulk of CRUD |
| **4. Workflow & notifications** | project status state machine + history; `NotificationService` + WS transport; announcement fan-out | Business core |
| **5. Files** | `StorageProvider` (local→S3), upload/download/delete, project file refs | Deliverables |
| **6. Ancillary** | attendance, timetable (+mentors), weekly updates, admin analytics endpoints | Remaining features |
| **7. Hardening** | rate limits, audit logging, deadline-reminder job, error envelopes, tests, OpenAPI spec | Production-readiness |
| **8. Frontend cutover** | `lib/api.ts`, re-point hooks/auth/files/notifications, drop Supabase SDK | §13; behind feature parity checks |
| **9. Deploy** | Dockerize API + Postgres, managed DB, object storage, env secrets, reverse proxy | Ship |

---

## 15. Open questions (please confirm before implementation)

1. **Express vs NestJS** — I recommend **Express + TypeScript + Prisma** for a thin, readable layer; NestJS if you expect heavy growth or prefer convention. Which?
2. **Approval-before-login** — should unapproved users be able to log in and see the pending screen (current frontend behavior), or be blocked at login entirely?
3. **Google OAuth now or later** — keep it in scope for v1, or ship email/password first and add Google after?
4. **Workflow "send-back" paths** — exact allowed backward transitions and who may trigger each (my §7 table is a proposed default).
5. **Section staffing rule** — hard-enforce "1 faculty + 3–4 student mentors", or warn-only?
6. **File storage target for production** — S3, MinIO (self-host), or local disk on the server box?
7. **Student↔section/team** — is a student in exactly one section and one team per academic year? Affects unique constraints.

---

*No code has been written. On your confirmation of the choices in §15 (especially #1), Phase 0 scaffolding begins.*

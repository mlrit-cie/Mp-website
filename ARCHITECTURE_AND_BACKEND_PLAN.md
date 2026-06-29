# MLRIT Project Hub — Architecture Analysis & Backend Plan

> ⚠️ **SUPERSEDED — backend direction changed.** The project owner has decided to build a **standalone backend independent of Supabase** (Node/Express or NestJS + PostgreSQL + JWT + REST). Supabase is now a placeholder only. **The authoritative backend design is `BACKEND_BLUEPRINT.md`.**
>
> What is still valid in *this* document: **Phase 1 (Project Overview)**, **Phase 2 (frontend architecture: folders, routing, components, state)**, and **Phase 4 (Gap Analysis)** — these describe the frontend and are largely backend-agnostic. **Ignore the Supabase-specific Phase 2.9 / Phase 3 / Phase 5 here** — they are replaced by the blueprint.

> Prepared as a technical-architect review. **No backend code has been written.**

---

## ⚠️ Executive summary (read this first)

Three findings dominate everything else:

1. **The "backend" already exists — it's Supabase (BaaS).** Every data hook calls `supabase.from(...)` / `supabase.storage` / `supabase.rpc(...)` directly from the browser using the anon key. There is no API server, and the README explicitly states *"No backend server needed."* So "build the backend" here means **complete the Supabase backend** (schema, Row-Level Security, triggers, RPC, storage, and un-mocking auth) — *not* stand up a Node/Express server. A separate server would require rewriting the entire data layer, violating "preserve existing frontend functionality."

2. **Authentication is currently MOCKED.** `AuthContext.login()` and `loginWithGoogle()` return a hard-coded fake user; the real Supabase Auth code is commented out. **The app cannot actually authenticate anyone today.** This is the #1 blocking gap.

3. **The only migration (`0001_initial_schema.sql`) is wrong, not merely incomplete.** It models a plaintext-password custom-auth users table and a 4-value `project_status` enum, while the code uses Supabase Auth (`auth_id`) and a 6-stage text workflow, and queries ~6 tables the migration never creates. The migration cannot be trusted as the source of truth; **the real schema is reconstructable from the frontend queries** (done below).

---

## PHASE 1 — Project Overview

**What it is:** *MLRIT Project Hub* (package name `project-sphere`) — a project-management portal for an academic department (CSE at MLR Institute of Technology). It tracks student capstone/mini projects through a multi-stage review-and-approval workflow, organized by academic *sections*, *teams*, and *mentors*.

**Target users / roles:** `admin`, `faculty`, `student_mentor`, `student`.

**Core features by role:**
- **Student** — edit their team's single project, upload deliverables (PPT, report, "Yukthi" file), advance it to review, see mentor feedback and deadlines.
- **Student Mentor** — create teams in assigned sections, review/advance projects, submit weekly updates.
- **Faculty** — review/approve projects in assigned sections, submit weekly updates, view today's schedule.
- **Admin** — full CRUD on sections/mentors/timetable, approve pending users, mark mentor attendance, view KPI dashboards (project status by section, domain popularity, mentor workload).

**Project lifecycle (the central business object):**
`Draft → Student Mentor Review → Faculty Review → Approved → Submitted to CIE → Completed`

**Business purpose:** Replace spreadsheet/manual tracking of departmental projects with a single source of truth that enforces the review pipeline, surfaces analytics, and archives completed work publicly.

---

## PHASE 2 — Architecture Documentation

### 2.1 Tech stack

| Layer | Choice |
|---|---|
| Build / dev | Vite 5 + `@vitejs/plugin-react-swc`, dev server on port **8080**, `lovable-tagger` (Lovable.dev export origin) |
| UI framework | React 18 + TypeScript (loose config: `strictNullChecks: false`, `noImplicitAny: false`) |
| Component lib | shadcn/ui (Radix primitives) — 49 files in `components/ui` |
| Styling | Tailwind CSS 3 + `tailwindcss-animate` + typography plugin |
| Routing | react-router-dom v6 |
| Server state | `@tanstack/react-query` v5 (used in *some* hooks only — see 2.6) |
| Backend SDK | `@supabase/supabase-js` v2 (Postgres + Auth + Storage + Realtime) |
| Forms / validation | react-hook-form + zod + `@hookform/resolvers` |
| Animation | framer-motion |
| Charts | recharts |
| Excel export | `xlsx` |
| Path alias | `@/*` → `src/*` |

### 2.2 Folder structure

```
mlrit-project-hub/
├── .kiro/settings/mcp.json        # Supabase MCP config — ⚠ contains real project_ref
├── supabase/migrations/
│   └── 0001_initial_schema.sql    # ⚠ STALE / wrong — does not match the code
├── frontend/
│   ├── .env                       # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (gitignored)
│   ├── vite.config.ts, tailwind.config.ts, tsconfig*.json
│   └── src/
│       ├── main.tsx               # React root
│       ├── App.tsx                # Providers + all routes + ProtectedRoute/RoleGate
│       ├── contexts/
│       │   └── AuthContext.tsx    # Auth state, login/register/google, profile — ⚠ MOCKED
│       ├── layouts/
│       │   └── DashboardLayout.tsx# Sidebar + outlet shell for protected pages
│       ├── pages/ (16)            # One per route (see 2.3)
│       ├── components/
│       │   ├── dashboards/ (4)    # Admin/Faculty/Mentor/Student dashboard bodies
│       │   ├── ui/ (49)           # shadcn primitives
│       │   ├── AppSidebar, NavLink, StatCard, StatusBadge,
│       │   ├── FileUpload         # Supabase Storage upload/signed-URL
│       │   ├── NotificationsBell, PendingApprovalsPanel, PendingApprovalScreen
│       ├── hooks/ (7)             # Data-access layer (see 2.6)
│       │   ├── useAdmin, useMentor, useProjects, useAnnouncements,
│       │   ├── useNotifications, use-toast, use-mobile
│       ├── lib/
│       │   ├── supabase.ts        # Client + DB-shaped TS interfaces
│       │   ├── types.ts           # Frontend domain types  ⚠ diverges from supabase.ts
│       │   ├── export.ts          # exportToExcel()
│       │   ├── utils.ts           # cn() etc.
│       │   └── mock-data.ts       # Demo seed data
│       └── test/                  # vitest + testing-library setup
```

### 2.3 Routing analysis (`App.tsx`)

**Public:** `/` (Index, redirects to `/dashboard` if logged in), `/login`, `/signup`, `/auth/callback`, `/archive`.
**Legacy redirects:** `/login/{admin,faculty,mentor,...}`, `/admin`, `/student`, `/faculty`, `/mentor` → all `Navigate` to `/login`.
**Protected (wrapped in `ProtectedRoute` + `DashboardLayout`):**

| Route | Guard | Roles |
|---|---|---|
| `/dashboard` | ProtectedRoute | all |
| `/sections` | RoleGate | admin, faculty, student_mentor |
| `/mentors` | RoleGate | admin |
| `/attendance` | RoleGate | admin |
| `/weekly-updates` | RoleGate | admin, faculty, student_mentor |
| `/timetable` | RoleGate | admin, faculty, student_mentor |
| `/teams`, `/projects`, `/announcements`, `/profile` | ProtectedRoute | all (internal role branching) |
| `*` | — | NotFound |

**Guard mechanics:** `ProtectedRoute` redirects to `/login` if no user, shows `PendingApprovalScreen` if `user.approved === false`. `RoleGate` additionally redirects to `/dashboard` if the role isn't permitted. **These are UX gates only, read from client state — see Phase 4 security.**

### 2.4 Authentication analysis (`AuthContext.tsx`)

- **Intended design:** Supabase Auth (email+password and Google OAuth restricted to `@mlrit.ac.in`). A `public.users` profile row is linked to the auth user via `auth_id`; `loadOrCreateProfile()` matches by `auth_id`, falls back to email link-up, else inserts. A Postgres trigger `handle_new_auth_user` is expected to auto-create the profile server-side on email-confirm signups.
- **Current reality:** `login()` and `loginWithGoogle()` are **mocked** — they `persist()` a fabricated user and `return { success: true }`. The real Supabase calls are commented out. `register()` and `completeGoogleLogin()` *do* call Supabase.
- **Session:** in-memory `user` mirrored to `localStorage('user')`; `onAuthStateChange` clears on sign-out.
- **Role derivation:** `getRoleFromEmail()` infers role from substrings in the email (`admin`/`faculty`/`mentor`) — a stopgap, not authoritative.
- **Approval gate:** new profiles default `approved=false`; admins approve/reject via `useAdmin`.

### 2.5 Authorization model

- **Client:** `RoleGate` / `ProtectedRoute` + per-page role branching.
- **Server (intended):** Supabase **Row-Level Security** is the *real* enforcement boundary. The code references an RLS policy `users_select_authenticated`, implying RLS is the design intent — but no policies exist in the repo.

### 2.6 State management

- **Global:** `AuthContext` (the only React context) holds the user and auth actions.
- **Server state — inconsistent pattern (code smell):**
  - `useAnnouncements` → proper React Query (`useQuery`/`useMutation` + invalidation).
  - `useAdmin`, `useMentor`, `useProjects` → manual `useState` + `useEffect` + imperative `fetch*()` / `refresh*()`. Not cached by React Query despite the provider being configured (`staleTime 30s`).
  - `useNotifications` → manual state **+ Supabase Realtime** subscription (`postgres_changes` on `notifications` filtered by `user_id`).
- **Local:** per-page `useState` for forms/dialogs.

### 2.7 Component hierarchy

```
App (QueryClientProvider → TooltipProvider → AuthProvider → BrowserRouter)
└── AppRoutes
    ├── Index / Login / SignUp / AuthCallback / Archive   (public)
    └── ProtectedRoute → DashboardLayout (AppSidebar + NotificationsBell + <Outlet/>)
        ├── Dashboard → { AdminDashboard | FacultyDashboard | MentorDashboard | StudentDashboard }
        ├── Sections (useAdmin)         ├── Mentors (users CRUD)
        ├── Teams (useMentor)           ├── Projects (useProjects + FileUpload)
        ├── Announcements (useAnnouncements)  ├── Attendance / Timetable / WeeklyUpdates
        └── Profile
```

### 2.8 Dependency notes
Mostly appropriate and modern. Observations: React Query is under-used (3 of 5 data hooks bypass it); `xlsx` (SheetJS) has had advisories — pin/track; `lovable-tagger` is dev-only (safe). No router-level code-splitting (`React.lazy`) — all pages eagerly imported.

---

## PHASE 2.9 — Reconstructed backend specification (from the code, not the migration)

These are the tables/columns/operations the **frontend actually queries**. This is the true spec.

**Tables & key columns**

| Table | Columns referenced by code | Notes |
|---|---|---|
| `users` | id (bigint), auth_id, name, email, role, approved, department, roll_number, phone, github_link, linkedin_link, section_id, created_at | role enum incl. `student_mentor` |
| `sections` | id, name, department, academic_year, semester, student_count, faculty_mentor_id, **student_mentor_ids** (array), year | |
| `teams` | id, name, section_id, created_by | |
| `team_members` | team_id, student_id | join table — **absent from migration** |
| `projects` | id, title, domain, abstract, github_link, video_link, ppt_file, report_file, yukthi_file, feedback, deadline, status, section_id, team_id, mentor_id, academic_year, updated_at | status = 6-stage text workflow |
| `mentor_assignments` | user_id, section_id | **absent from migration** |
| `announcements` | id, title, content, author_id, **target_audience** (`all`\|`mentors_only`), created_at | code uses `target_audience`, migration has `target_role` |
| `attendance` | user_id, attendance_date, status (`present`\|`absent`\|`late`), notes, marked_by, marked_at | **absent from migration** |
| `timetable` | id, section_id, day_of_week, start_time, end_time, subject, room_number, faculty_id, **student_mentor_ids** (array) | **absent**; uses `.contains()` array query |
| `weekly_updates` | id, user_id, week_starting, content, created_at | UPSERT on (user_id, week_starting); **absent** |
| `notifications` | id, user_id, type, title, message, link, read_at, created_at | **Realtime-subscribed**; **absent** |

**Non-table backend objects the code depends on (all currently missing):**
- **RPC** `get_archived_projects()` — returns approved/completed projects joined with section/team/members (used by `/archive`, callable anonymously).
- **Trigger** `handle_new_auth_user` on `auth.users` — creates a `public.users` profile row on signup.
- **Trigger** `set_updated_at` — exists in migration; extend to all real tables.
- **Storage bucket** `project-files` — path scheme `{teamId}/{kind}/{ts}_{filename}`, 20 MB cap, signed URLs (1 h). Needs bucket + access policies.
- **Realtime** must be enabled on `notifications`.
- **RLS policies** on every table (none exist).

---

## PHASE 3 — Backend plan *(CONFIRMED DECISIONS)*

> **Decisions locked in by the project owner:**
> - **Backend = HYBRID.** Supabase stays the system of record for auth, storage, realtime, and simple RLS-protected reads. A **thin server** owns *sensitive/privileged* logic (workflow transitions, notification fan-out, transactional multi-table writes, bulk imports) using the Supabase **service-role** key — never exposed to the browser.
> - **Roles = hybrid default + admin override.** Email inference sets the *initial* role at signup; an admin can change it afterward via an authoritative `users.role` column.
> - **Database = clean build.** No production data to preserve — design fresh migrations + seed.

### Hybrid responsibility split

**Stays client → Supabase (guarded by RLS):**
- Supabase Auth (email/password + Google OAuth, `@mlrit.ac.in` only) and the approval gate.
- Storage `project-files` bucket (upload + signed URLs) via the existing `FileUpload` component.
- Realtime `notifications` subscription.
- Simple reads/writes already RLS-safe: profile read/update, announcements list, sections/teams/timetable reads.

**Moves to the thin server (service-role, privileged):**
- **Project workflow transitions** — validate the legal `Draft→…→Completed` step *and* the actor's role/section before mutating; the only writer of `projects.status`.
- **Notification fan-out** — emit rows on status change, assignment, deadline reminders.
- **Transactional writes** — `createTeam` (team + members + default project) as one atomic operation.
- **Bulk mentor CSV import** and **user approve/reject**.
- **Dashboard aggregations** that today fetch-all-and-group in JS.

> Note: RLS is **still required** even in hybrid, because the client still talks to Supabase directly for the "stays client" set above.

**Architecture:** Supabase (Postgres + Auth + Storage + Realtime) + a thin TypeScript API service. The "backend" deliverables are: **versioned SQL migrations + RLS policies + Postgres functions/triggers + storage config** (Supabase side) **and a small API service** for privileged endpoints.

**Proposed `supabase/` structure:**
```
supabase/
├── migrations/
│   ├── 0001_… (REPLACE — current one is wrong)
│   ├── 00XX_core_schema.sql        # all tables above, correct enums, FKs, indexes
│   ├── 00XX_auth_trigger.sql       # handle_new_auth_user
│   ├── 00XX_rls_policies.sql       # per-table, per-role policies
│   ├── 00XX_rpc_archive.sql        # get_archived_projects()
│   ├── 00XX_notifications_fn.sql   # triggers that emit notifications on status change etc.
│   └── 00XX_storage.sql            # project-files bucket + policies
├── seed.sql                        # dev seed (mirrors mock-data.ts)
└── config.toml
```

**Auth strategy:** Un-mock `AuthContext` (delete the mock blocks, restore the real calls). Enforce `@mlrit.ac.in` domain. Keep approval gate. Decide whether role comes from email-inference (current) or an admin-assigned column (recommended — see questions).

**Authorization strategy (RLS — the real security layer):**
- `users`: a user reads/updates own row; admin all; mentors read users in assigned sections.
- `projects`: students read/update only their team's project (and only while `Draft`); mentors/faculty read+advance within assigned sections; admin all. Enforce **legal status transitions** in a trigger or `WITH CHECK`.
- `sections`/`mentors`/`timetable`/`attendance`: write = admin; read scoped by assignment.
- `weekly_updates`: write own; admin reads all.
- `notifications`: read/update only own rows.
- `announcements`: insert = admin/mentor; `mentors_only` rows hidden from students.
- Replace client-trusted role with a SQL helper (`auth.uid()` → role lookup) so RLS can't be spoofed.

**Validation:** zod on the client (mostly present) **+** DB constraints (CHECK on enums, NOT NULL, FK `on delete` rules, the array-size rule "3–4 student mentors").

**Error handling / logging:** standardize hook error shape; rely on Postgres constraint errors surfaced through Supabase; enable Supabase logs/auditing.

---

## PHASE 4 — Gap analysis

**Blocking**
1. **Auth is mocked** — no real login/Google. App is non-functional for real users until un-mocked.
2. **Schema missing/wrong** — 6 tables, RPC, triggers, storage bucket, and all RLS absent; existing migration contradicts the code (plaintext `password`, wrong `project_status` enum, `target_role` vs `target_audience`).

**Security**
3. **No RLS = full data exposure.** With the anon key in the browser and no RLS, any visitor can read/write every table directly. This is the single biggest risk.
4. **Client-side role is spoofable** — `switchRole()` mutates the user's own role in state/localStorage; `RoleGate` then trusts it. Authorization must live in RLS, not React.
5. **Real `project_ref` committed** in `.kiro/settings/mcp.json` (token is a placeholder, so low severity, but the project ref should not be public).
6. **`get_archived_projects` RPC is anonymous** — ensure it returns only approved/completed and no PII.

**Correctness / code smells**
7. **Dual `User` type** — `lib/types.ts` (`id: string`) vs `lib/supabase.ts` (`id: number`); status enums differ too. Risk of subtle bugs; consolidate and generate types from the DB.
8. **Inconsistent data layer** — 3 hooks hand-roll fetching outside React Query (no caching, manual refresh, refetch waterfalls e.g. `useMentor.fetchSectionData` does N sequential queries).
9. `createTeam` performs multi-step inserts (team → members → default project) with **no transaction** — partial failure leaves orphan rows. Move to an RPC/transaction.
10. **No route code-splitting**; loose TS (`strictNullChecks: false`) hides null bugs.

**Scalability/perf:** several "fetch all then count/group in JS" patterns (domain popularity, section stats, mentor workload) — fine at department scale, but belong in SQL aggregates/RPC as data grows.

---

## PHASE 5 — Implementation roadmap (recommended path)

| Phase | Deliverable | Why first |
|---|---|---|
| **1. Auth foundation** | Un-mock `AuthContext`; wire real email/password + Google OAuth; confirm `handle_new_auth_user` trigger; verify approval gate | Nothing works without real auth |
| **2. Correct schema** | New migrations for all 11 tables w/ correct enums, FKs, indexes; retire the wrong `0001`; `seed.sql` | The spec foundation |
| **3. Security (RLS)** | Per-table per-role policies + a role-lookup helper; lock down anon access; storage-bucket policies | Closes the critical exposure |
| **4. Server objects** | `get_archived_projects` RPC; notification-emitting triggers (status change, assignment, deadline); `updated_at` triggers everywhere; `create_team` transactional RPC | Makes archive/notifications/teams correct |
| **5. Data-layer cleanup** | Migrate the 3 imperative hooks to React Query; consolidate the dual `User` type; generate types via Supabase CLI | Consistency & maintainability |
| **6. Hardening & deploy** | Move `project_ref` out of VCS; SQL aggregates for dashboards; route code-splitting; production Supabase project + env management | Scale & polish |

---

## ❓ The one decision that blocks Phase 3 implementation

I need your call on **what "backend" should mean** before writing any SQL or server code. My strong recommendation, given the frontend is already a complete Supabase client, is **Option A**. Secondary questions follow.

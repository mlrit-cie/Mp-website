# Modules — layered architecture

Every feature module follows the same layering (see `BACKEND_BLUEPRINT.md §11`):

```
Routes  →  Controllers  →  Services  →  Repositories  →  Prisma  →  PostgreSQL
```

- **`*.routes.ts`** — path + HTTP method, attaches middleware (`requireAuth`, `requireRole`, `validate`). No logic.
- **`*.controller.ts`** — parse request → call service → shape response. No DB, no business rules.
- **`*.service.ts`** — business logic, authorization scoping, orchestration. Throws typed errors from `lib/errors.ts`.
- **`*.repository.ts`** — all Prisma access for the module. The only layer that touches the DB.
- **`*.schema.ts`** — zod request/response schemas.

`health/` is the reference implementation (routes + controller; no service needed).

### Planned modules (by roadmap phase)
| Phase | Modules |
|------|---------|
| 1 | `auth` (+ `middleware/requireAuth`, `requireRole`, `requireApproved`, `validate`) |
| 3 | `users`, `sections`, `teams` |
| 4 | `projects` (status workflow state machine) |
| 5 | `files` (+ `services/StorageProvider`) |
| 6 | `announcements`, `notifications` (+ Socket.IO rooms) |
| 7 | `admin` (analytics), `attendance`, `timetable`, `weeklyUpdates` |

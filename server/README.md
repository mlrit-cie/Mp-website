# MLRIT Project Hub — Backend API

Standalone REST API for the MLRIT Project Hub frontend.

**Stack:** Node.js · Express · TypeScript · Prisma · PostgreSQL · JWT · Socket.IO
**Architecture:** `Routes → Controllers → Services → Repositories → Prisma → PostgreSQL` (layered).
**Design reference:** [`../BACKEND_BLUEPRINT.md`](../BACKEND_BLUEPRINT.md)

> **Status: Phase 0 (scaffolding).** The app boots, validates config, exposes health checks, and has the full middleware pipeline + Socket.IO plumbing. Auth, models, and feature APIs arrive in later phases (see the roadmap in the blueprint).

## Prerequisites
- Node.js 18+
- PostgreSQL 14+ (only needed once you run migrations / the DB health check)

## Setup
```bash
cd server
cp .env.example .env        # then edit values (DATABASE_URL, JWT secrets)
npm install                 # also runs `prisma generate`
```

## Run
```bash
npm run dev                 # tsx watch, http://localhost:3001
npm run build && npm start  # compiled production build
```

## Verify
```bash
curl http://localhost:3001/health        # { "status": "ok" }
curl http://localhost:3001/api/health     # service info
curl http://localhost:3001/api/health/db  # database liveness (needs Postgres)
```

## Scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server with hot reload (tsx) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled build |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest suite |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Create/apply a dev migration (Phase 2+) |
| `npm run prisma:studio` | Browse the DB |

## Layout
```
server/
├── prisma/schema.prisma        # datasource + generator (models land in Phase 2)
├── src/
│   ├── config/env.ts           # zod-validated runtime config
│   ├── lib/                     # logger, typed errors
│   ├── db/prisma.ts             # PrismaClient singleton + DB health probe
│   ├── middleware/              # errorHandler, notFound (auth/validate in Phase 1)
│   ├── realtime/socket.ts       # Socket.IO bootstrap
│   ├── modules/                 # feature-first; see modules/README.md
│   │   └── health/              # reference layered module
│   ├── routes/index.ts          # root /api router
│   ├── app.ts                   # express app + middleware pipeline (no listen)
│   └── server.ts                # http + socket bootstrap + graceful shutdown
└── tests/                       # vitest + supertest
```

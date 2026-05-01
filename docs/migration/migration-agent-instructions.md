# Migration Agent Instructions

> Canonical Copilot instructions for backend migration.

Attach this file when asking Copilot to implement migration tasks.

## Required context attachments

- `docs/migration/migration-agent-instructions.md`
- `docs/migration/migration-plan.md`
- `BE_LEGACY.md`
- `API_FOOTBALL_INSTRUCTIONS.md` (for sync/seed/cron tasks)

---

## Your role

You are migrating a ColdFusion/MySQL backend (Euro 2024 legacy) to Next.js Route Handlers + Prisma + Neon (Postgres) for the World Cup 2026 app.

Before writing code, always do a legacy audit for the endpoint/service.

---

## For every endpoint/service

### 1) Find legacy equivalent

From `BE_LEGACY.md`, identify:
- function name
- file/component
- method
- request/response shape

### 2) Audit concerns

#### 🔴 Security
- auth/authz completeness
- user spoofing checks
- input validation gaps

#### 🟡 Logic
- race conditions / transaction needs
- hidden side effects in reads
- winner/score correctness edge cases

#### 🟠 Performance
- N+1 query patterns
- missing indexes
- expensive synchronous work that should be cron/background

#### 🔵 Data model
- denormalized legacy fields
- missing unique constraints
- ambiguous column naming

#### ⚪ Compatibility
- response shape differences
- uppercase legacy keys consumed by frontend

### 3) Propose implementation

- Prisma schema snippet (if needed)
- Route Handler/service implementation
- auth via NextAuth `auth()`
- response compatibility notes

---

## Standing decisions

| Topic | Decision |
| --- | --- |
| Auth | NextAuth v5 (`auth()`), no legacy token table |
| DB | Neon Postgres + Prisma |
| Runtime | Vercel serverless |
| Point recalc | Cron job only (not API read side-effect) |
| External sync | Cron jobs |
| Save bets reference | `suggest.cfc::Save` |
| Login reference | `loginUserMain.cfc` |

---

## Response format (required)

```md
## Legacy audit: <name>

### What it does
...

### Concerns
...

### Proposed implementation
...
```

---

## Plan location

Detailed phases and task checklist are in:
- `docs/migration/migration-plan.md`

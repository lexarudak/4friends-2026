# Migration Plan & Progress

> Canonical execution plan for BE + DB migration to WC 2026.

## Setup

```bash
npm install prisma @prisma/client @neondatabase/serverless @prisma/adapter-neon zod
npx prisma init --datasource-provider postgresql
```

Env vars:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `FOOTBALL_API_KEY`
- `CRON_SECRET`

---

## Phase 1 — Database

- [x] 1.1 Create Neon project
- [ ] 1.2 Define Prisma schema
- [ ] 1.3 Run initial migration
- [ ] 1.4 Implement seed script (manual fallback + API mode)

Models:

- `Room`
- `User`
- `UserRoom`
- `Team`
- `Match`
- `MatchApiData`
- `Bet`
- `TotalPoints`
- `StandingsCache`

Notes:

- no `UserTokens` table
- no `CountryCodeMapping` table
- `User.id` = Google email
- WC2026 scale: 48 teams / ~104 matches

---

## Phase 2 — Auth/User

- [ ] 2.1 Replace in-memory user reads/writes in `src/auth.ts` with Prisma
- [ ] 2.2 Replace `src/db/users.ts` store with Prisma

---

## Phase 3 — Endpoints

- [ ] 3.1 `GET /api/matches`
- [ ] 3.2 `GET /api/bets` + `POST /api/bets`
- [ ] 3.3 `GET /api/table`
- [ ] 3.4 `GET /api/user`
- [ ] 3.5 `POST /api/rooms/join`
- [ ] 3.6 `POST /api/rooms/switch`
- [ ] 3.7 `GET /api/standings`

---

## Phase 4 — Cron

- [ ] 4.1 `/api/cron/sync-fixtures`
- [ ] 4.2 `/api/cron/calc-points`
- [ ] 4.3 `/api/cron/sync-standings`

Recommended schedules:

- sync fixtures: every 5 min
- calc points: every 10 min
- sync standings: daily 03:00 UTC

---

## Phase 5 — Onboarding

- [ ] First Google login creates user (`activeRoomId = null`)
- [ ] `/rooms` join flow updates active room + session

---

## Phase 6 — Cleanup

- [ ] Remove in-memory DB files in `src/db/*`
- [ ] Remove obsolete stubs/hardcoded matches
- [ ] Update `README.md`

---

## Important WC2026 API limitation

As of 2026-04-30 on free plan:

- `league=1&season=2026` fixtures/teams unavailable
- standings endpoint returns plan access error

Therefore seed and early development must support manual JSON fallback.

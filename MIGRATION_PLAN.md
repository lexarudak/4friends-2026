# Migration Plan & Progress

> Canonical version: `docs/migration/migration-plan.md`.
> This root file is kept for backward compatibility.

> Detailed execution plan for BE + DB migration to World Cup 2026.

## Tools to install (once, before starting)

```bash
npm install prisma @prisma/client @neondatabase/serverless @prisma/adapter-neon zod
npx prisma init --datasource-provider postgresql
```

**Env vars required:**

```
DATABASE_URL=           # Neon pooled connection string
DATABASE_URL_UNPOOLED=  # Neon direct (for migrations)
FOOTBALL_API_KEY=       # from .env — currently hardcoded in connectorapi.cfc
CRON_SECRET=            # Vercel sets this automatically
```

---

## Agent file matrix

| Task type       | Files to attach                                                                     |
| --------------- | ----------------------------------------------------------------------------------- |
| Prisma schema   | `MIGRATION_AGENT_INSTRUCTIONS.md` + `BE_LEGACY.md`                                  |
| Endpoint        | `MIGRATION_AGENT_INSTRUCTIONS.md` + `BE_LEGACY.md`                                  |
| Cron / sync job | `MIGRATION_AGENT_INSTRUCTIONS.md` + `BE_LEGACY.md` + `API_FOOTBALL_INSTRUCTIONS.md` |
| Seed script     | `BE_LEGACY.md` + `API_FOOTBALL_INSTRUCTIONS.md`                                     |

---

## Phase 1 — Database

- [x] **1.1** Create Neon project at [neon.tech](https://neon.tech), copy `DATABASE_URL` + `DATABASE_URL_UNPOOLED` to `.env`
- [ ] **1.2** Write `prisma/schema.prisma` with all models (see model list below)
- [ ] **1.3** `npx prisma migrate dev --name init`
- [ ] **1.4** Write + run `prisma/seed.ts` — teams → matches → standings cache

> ⚠️ **WC 2026 API data not yet available (verified 2026-04-30):** `GET /teams`, `GET /fixtures`, and `GET /standings` all return 0 results or errors on the free plan for league=1&season=2026. Seed must use a **manual JSON fallback** (48 qualified teams, fixture schedule) until the API publishes data. See `API_FOOTBALL_INSTRUCTIONS.md` for details.

**Prisma models (in dependency order):**

1. `Room` — id, name, capacity
2. `User` — id (Google email PK), username, activeRoomId FK → Room
3. `UserRoom` — userId FK, roomId FK (junction)
4. `Team` — id (api-football ID), name, code, logo
5. `Match` — id (fixture ID), homeTeamId FK, awayTeamId FK, homeScore, awayScore, winner, extra (bool), round, group, datetime, statusShort, statusLong, statusType
6. `MatchApiData` — matchId FK (1:1), all raw api-football fields (halftime, fulltime, extratime, penalty, periods, elapsed)
7. `Bet` — id, userId FK, roomId FK, matchId FK, goalsHome, goalsAway, winner, pointsMatch, pointsExtra, createdAt, updatedAt
8. `TotalPoints` — composite PK (userId, roomId), points
9. `StandingsCache` — single-row, jsonData, updatedAt

> ⚠️ No `UserTokens` model — replaced by NextAuth v5.  
> ⚠️ No `CountryCodeMapping` model — API returns `code` directly once WC 2026 data is published.  
> ⚠️ `User.id` = Google email — consistent with existing `auth.ts` usage.  
> ⚠️ WC 2026 = **48 teams, ~104 matches** (vs 24/51 for Euro 2024) — bet pre-fill on room join will insert ~104 rows per user.

---

## Phase 2 — Auth & User Bootstrap

- [ ] **2.1** Update `src/auth.ts` — replace in-memory `UserService` calls with Prisma upsert on first login
- [ ] **2.2** Replace `src/db/users.ts` in-memory Map with Prisma queries

---

## Phase 3 — Endpoints

Implement in this order. Each must have a legacy audit before coding.

| #   | Route               | Method     | Replaces (legacy)                                  | Replaces (stub)                 | Status |
| --- | ------------------- | ---------- | -------------------------------------------------- | ------------------------------- | ------ |
| 3.1 | `/api/matches`      | GET        | `suggest.cfc::getAllMatches`, `getNextMatches.cfc` | `src/db/matches.ts`             | ⬜     |
| 3.2 | `/api/bets`         | GET + POST | `getUserBets.cfc`, `suggest.cfc::Save`             | `src/db/bets.ts`                | ⬜     |
| 3.3 | `/api/table`        | GET        | `getTotalPoints.cfc`                               | `src/services/table.service.ts` | ⬜     |
| 3.4 | `/api/user`         | GET        | `getUserInfo.cfc`                                  | —                               | ⬜     |
| 3.5 | `/api/rooms/join`   | POST       | `suggest.cfc::addRoomUser`                         | `src/db/rooms.ts`               | ⬜     |
| 3.6 | `/api/rooms/switch` | POST       | `suggest.cfc::changeActiveRoom`                    | —                               | ⬜     |
| 3.7 | `/api/standings`    | GET        | `getStandings.cfc`                                 | —                               | ⬜     |

> Mark ⬜ → 🔄 when in progress, 🔄 → ✅ when done.

---

## Phase 4 — Cron Jobs

Add to `vercel.json`:

```json
{
	"crons": [
		{ "path": "/api/cron/sync-fixtures", "schedule": "*/5 * * * *" },
		{ "path": "/api/cron/calc-points", "schedule": "*/10 * * * *" },
		{ "path": "/api/cron/sync-standings", "schedule": "0 3 * * *" }
	]
}
```

| #   | Route                      | Replaces                                                                                                | Status |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| 4.1 | `/api/cron/sync-fixtures`  | `connectorapi.cfc::getFixturesEuro2024` — use `league=1&season=2026`                                    | ⬜     |
| 4.2 | `/api/cron/calc-points`    | Side-effect UPDATE inside `getUserBets.cfc`                                                             | ⬜     |
| 4.3 | `/api/cron/sync-standings` | `connectorapi.cfc::getStandingsEuro2024` — use `league=1&season=2026`; ⚠️ currently errors on free plan | ⬜     |

**Scoring rules for 4.2 (from legacy):**
| Condition | `pointsMatch` |
|---|---|
| Exact score | 3 |
| Correct goal diff (not exact) | 2 |
| Correct winner only | 1 |
| Wrong | 0 |
| Correct extra-time winner | +2 (`pointsExtra`) |

---

## Phase 5 — Onboarding

No `registerUser` endpoint — Google OAuth replaces email/password entirely.

New flow (already partially wired in `auth.ts`):

1. First Google login → `User` upserted with `activeRoomId = null`
2. Middleware redirects to `/rooms`
3. User picks a room → `POST /api/rooms/join` → session updated → home

- [ ] **5.1** Verify `/rooms` page calls `POST /api/rooms/join` and updates session via `unstable_update`

---

## Phase 6 — Cleanup

- [ ] Delete all `src/db/*.ts` in-memory stores
- [ ] Delete hardcoded match stub in `src/db/matches.ts`
- [ ] Update `README.md` with new stack

---

## Dependency graph

```
Phase 1 (DB + Schema)
  └── Phase 2 (Auth / User)
        ├── 3.1 matches ──── 4.1 sync-fixtures
        ├── 3.2 bets ──────── 4.2 calc-points
        ├── 3.3 table
        ├── 3.4 user info
        ├── 3.5 join room
        ├── 3.6 switch room
        └── 3.7 standings ── 4.3 sync-standings
```

---
name: database-schema
description: "Prisma schema models, migrations, and seeding strategy for the 4friends-2026 Neon Postgres database"
metadata: 
  node_type: memory
  type: project
  originSessionId: aa512491-4986-4ba6-a317-1f5fc9f47079
---

Database: **Prisma Postgres** (managed, host `db.prisma.io`; `DATABASE_URL` + `DATABASE_URL_UNPOOLED`). ORM: Prisma 7.8. Adapter: `@prisma/adapter-pg`. Schema at `/prisma/schema.prisma`. (Originally provisioned on Neon — migrated to Prisma Postgres; older notes saying "Neon" are stale.)

**Backups/recovery:** Prisma Postgres takes **daily snapshots** (only on days with DB activity), retained ~7 days (Starter/Pro) or 30 days (Business). **No point-in-time restore** yet — snapshot granularity only. Restore via Prisma Console → Backups tab ("re-instantiate" a snapshot into a new instance). For surgical row recovery, re-instantiate a pre-incident snapshot to a separate instance, extract the needed rows, and upsert them into prod (don't restore in place — that rolls back all users).

## Models

**Room** — betting pool/group
- `id` String @id @default(cuid())
- `name` String @unique
- Relations: `users UserRoom[]`, `currentForUsers User[]`

**User** — identified by email (Google OAuth)
- `id` String @id (= email address)
- `currentRoom` String? (FK → Room.name)
- `name` String?
- Relations: `bets Bet[]`, `rooms UserRoom[]`

**UserRoom** — many-to-many membership junction
- `id`, `userId`, `roomId`, `joinedAt`
- @@unique([userId, roomId])
- Cascade delete on user/room deletion

**Match** — fixture data (40+ fields)
- `id` Int @id (= api-football fixture ID; **placeholder IDs 1-104** until real data available)
- Key fields: `date DateTime`, `timestamp Int`, `timezone`, `referee?`
- Teams: `homeTeamId/Name/Code/Logo`, `awayTeamId/Name/Code/Logo`
- Scores: `homeGoals/awayGoals/homeGoalsHT/awayGoalsHT`
- Status: `statusShort` (NS/1H/HT/2H/FT/AET/PEN/etc.), `statusElapsed?`
- League/round info, venue info, winner flags

**Bet** — one prediction per user per match per room
- `id` Int @id @default(autoincrement())
- `userId`, `matchId`, `roomId`
- `betHome Int`, `betAway Int` — predicted score
- `winPick Int?` — team ID for playoff winner prediction
- `points Int?`, `bonusPoints Int?` — filled after match completes
- @@unique([userId, matchId, roomId])

**StandingsCache** — single-row JSON cache of group standings
(No `TotalPoints` model exists in the live schema — points live on `Bet.points`/`bonusPoints` and are aggregated via `prisma.bet.groupBy` + cached in `StandingsCache`.)

## Migrations (6 total, `/prisma/migrations/`)
1. `20260501062538_create_room_table`
2. `20260501081502_add_user_table`
3. `20260501100551_add_match_table`
4. `20260501140828_add_bet_table`
5. `20260501141552_add_user_name`
6. `20260523152118_add_user_room_membership` ← latest

## Seeding (`/scripts/`)
- `seed-wc2026-static.ts` — 104 WC2026 matches, all groups (A–L) + knockout, **placeholder IDs 1–104**
- `seed-matches.ts` — fetches from api-football (WC2026 not yet available as of 2026-04-30)
- `seed-past-match-results-and-points.ts` — seeds deterministic results + calculates points
- `seed-test-player-bets.ts`, `seed-local-test-users.ts` — dev data

## Prisma Client
Singleton pattern in `/src/lib/prisma.ts`. SSL normalized to verify-full. Global cache in dev.
Config at `/prisma.config.ts`.

**Why:** placeholder IDs will need replacement when api-football publishes WC2026 fixture data (expected June 2026). See [[project-constraints]].

---
name: tournaments-and-db
description: Multi-tournament isolation model and the Prisma Postgres / Accelerate connection setup
metadata:
  type: project
---

## Multi-tournament isolation

The app supports multiple tournaments in parallel (e.g. `wc2026`, `ucl2526`), each fully isolated.

- **`Room.tournament`** (String, default `wc2026`) — every room belongs to one tournament. Set at create time via admin UI selector.
- **`Match.tournament`** (String, default `wc2026`, indexed) — every match is tagged. This is the key filter.
- Tournament slug ↔ league/season mapping + labels live in **`src/lib/tournaments.ts`** (`TOURNAMENTS`, `getTournamentLabel`, `tournamentForLeague`).
- **`getActiveRoomTournament()`** in `src/lib/active-room.ts` resolves the current room's tournament; every match-listing path threads it through.

**All match queries filter by `tournament`:**
- `MatchService.getMatches(tournament)` / `getNextMatchTimerPayload(tournament)`
- `ScheduleService.getScheduleMatches(tournament, roomId)`
- `WorldCupService.getTournamentData(tournament)` — `/world-cup` page is now tournament-aware (UCL rooms see UCL bracket, not WC). Bracket defaults to "Group" tab which is empty for knockout-only tournaments.
- `GlobalTopService.getSections(tournament, userId)` — lists participants = UserRoom members of the tournament's rooms ∪ anyone with a bet in those rooms. Each metric independently takes the user's best room; fallback room shown after name as `name | room`.

**Sync stays global:** `FootballApi.fetchLiveFixtures()` uses `live=all` (no league filter). `persistFixtures` only updates matches already in the DB (filtered by known IDs), so one API call covers all tournaments and never mis-tags. `applyFixture` does NOT touch `tournament`, so the seed-time tag is preserved.

## Connection setup (Prisma Postgres + Accelerate)

`src/lib/prisma.ts` branches on `DATABASE_URL`:
- `prisma+postgres://...?api_key=...` (or `prisma://`) → `new PrismaClient({ accelerateUrl })` — pooled HTTP, no TCP connection limit. **Required for serverless/Vercel runtime.**
- otherwise (local `localhost`) → `PrismaPg` adapter, bounded pool (`max` = `DB_POOL_MAX` ?? 3).
- Singleton cached on `globalThis` in ALL environments.

**Why:** the direct `postgres://...@db.prisma.io:5432` URL connects as role `prisma_migration` with a tiny connection cap. Under polling + lazy sync load it threw `P2037 too many connections`. Fix: runtime uses the Accelerate (`prisma+postgres://`) URL; direct URL only for migrations.

**Migrations** use `DATABASE_URL_UNPOOLED ?? DATABASE_URL` (see `prisma.config.ts`) — Accelerate URL can't run migrations. Vercel only runs `prisma generate` at build (no DB connection), so it needs no UNPOOLED var. `FOOTBALL_API_KEY` must be set in Vercel for live sync to work.

## Free vs Pro plan & real fixture import (IMPORTANT)

api-football free plan: season listing (`?league=&season=`) only for **2022–2024**; date listing (`?date=`) only a **3-day window** (yesterday/today/tomorrow). `live=all`, `?id=`, `?ids=` (batch up to 20) are NOT season-gated.

**Strategy "pull on Pro, run on free":** subscribe to Pro once → bulk-import a tournament's real fixtures into the DB → downgrade. Stored matches then stay live via `live=all` + `?id=` (both free). The article confirming endpoints: saved by user; key ids `league=1 season=2026`.

**`scripts/import-tournament.ts <leagueId> <season> <slug> [--from] [--to] [--purge]`** (npm `import:tournament`): pulls `/fixtures` + `/standings`, upserts matches tagged with the tournament, and sets `Match.groupName` from standings (teamId→"Group X"). `--purge` deletes the tournament's existing matches+bets first (used to replace the old placeholder WC seed with real fixture IDs).

- WC2026 imported with REAL fixture ids (placeholders 1–104 are gone). As of import only the **72 group-stage** matches exist; the 32 knockout fixtures appear progressively during the tournament — re-run `import:tournament` (while Pro) to pull them.
- **`Match.groupName`** (nullable) holds "Group A".."Group L" — the API `round` is only "Group Stage - 1/2/3" (matchday), so group letter comes from `/standings`. `WorldCupService`, `MatchService`, `ScheduleService` all prefer `groupName` and fall back to `toGroupLabel(round)`.

**Local migrations gotcha:** `prisma.config.ts` uses `DATABASE_URL_UNPOOLED ?? DATABASE_URL`; `.env` has UNPOOLED = prod. So `migrate dev` must be run with BOTH vars pointed local: `DATABASE_URL=<local> DATABASE_URL_UNPOOLED=<local> npx prisma migrate dev`. Prod schema changes go via `npx prisma migrate deploy` (uses prod UNPOOLED).

## Seeding / test scripts
- `scripts/import-fixture.ts <fixtureId> <tournamentSlug>` — pulls one fixture from api-football and upserts it tagged with a tournament (used for the live UCL final 1544371). After import, lazy sync keeps it live.
- `scripts/seed-ucl-final.ts`, `scripts/seed-ucl-psg-arsenal.ts` — UCL test data.
- `scripts/seed-wc2026-static.ts` — 104 WC matches, tagged `wc2026`.
- To target prod without leaking creds in argv: `DATABASE_URL="$(grep '^DATABASE_URL=' .env | cut -d= -f2-)" npx tsx scripts/...`

## Related
- [[database-schema]]
- [[backend-architecture]]
- [[migration-status]]

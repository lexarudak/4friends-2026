---
name: migration-status
description: Current implementation phase, what is done vs pending, and known issues for the 4friends-2026 rewrite
metadata:
  type: project
---

This is a ground-up rewrite of a ColdFusion/MySQL Euro 2024 app. Status as of 2026-05-30.

**Why:** Legacy stack (ColdFusion) was not maintainable. WC2026 is the opportunity to rewrite cleanly.
**How to apply:** Before suggesting new work, check what phase we're in and whether the area is still a stub.

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| Phase 1: Database | ✅ Done | Neon, Prisma, 8 migrations applied (incl. ApiQuota, StandingsCache) |
| Phase 2: Auth | ✅ Done | NextAuth v5, Google OAuth, room selection flow |
| Phase 3: Endpoints | ✅ Done | bets, matches, next-match, table, room-statistic, admin/quota live |
| Phase 4: Sync Infrastructure | ✅ Done | FootballApiClient + FixtureSyncService + PointsCalculator |
| Phase 5: Cron Jobs | ✅ Done | sync-fixtures (02:00 UTC), sync-standings (03:00 UTC) via vercel.json |
| Phase 6: Cleanup | ⬜ Not started | In-memory stubs still present |

## Sync Architecture (Phase 4) — implemented

**Strategy:** Lazy pull-based. No cron for live sync. API called when user hits `/api/next-match` and cache is stale.

- `src/lib/football-api.ts` — FootballApi client, quota guard (soft 95, hard 99), `ApiQuota` table per UTC day
- `src/services/fixture-sync.service.ts` — `ensureFresh()`: checks active matches → TTL (5 min group, 3 min QF+) → pg_try_advisory_lock → fetchLiveFixtures → upsert → recalculate points on FT/AET/PEN transition
- `src/services/points-calculator.ts` — `PointsCalculator.recalculate(matchId)` — pure points calc, triggered on status transition to FT/AET/PEN
- `/api/next-match?sync=wait` — sync blocks response (used on kickoff). Default: sync in `after()` stale-while-revalidate
- Client polls `/api/next-match` every 30s when `hasLive=true`, stops when no live
- `src/utils/live-minute.ts` + `LiveMinute` component — client-side minute projection from `elapsed + minutesSince(lastSyncAt)` with 45+/90+/120+ capping

## Testing Tools

- `npm run seed:live-test -- <N>` — creates match starting in N min, walks full lifecycle (NS→1H→HT→2H→FT) auto with 1-min pauses, seeds bets for 8 test players
- `npm run simulate:match -- <id> --step <step>` — manual step-by-step simulation

## In-Memory Stubs to Replace (Phase 6)
- `/src/db/scores.ts`
- `/src/db/room-statistic.ts`
- `/src/db/world-cup.ts`

## Known Issues / Gotchas
1. **WC2026 API data gap** — api-football free plan has no WC2026 data yet (as of 2026-04-30). Seed uses manual JSON with placeholder fixture IDs 1–104. Real IDs needed when API publishes (~June 2026). See [[project-constraints]].
2. **StandingsCache** — model exists, sync-standings cron wired, but `WorldCupService` still builds group standings from Match table — not yet reading from StandingsCache.
3. **UserRoom migration** — `joinRoomAndSetCurrent` in RoomService handles both legacy `currentRoom` field and new UserRoom junction table for backwards compat.
4. **48 teams vs 24** — WC2026 is larger; pre-fill on room join creates ~104 bets per user vs 51 for Euro2024.
5. **CRON_SECRET** — must be added to Vercel project env vars before deploy, and to `.env.example`.

## Related Memories
- [[database-schema]]
- [[backend-architecture]]
- [[project-constraints]]

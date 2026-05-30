---
name: migration-status
description: "Current implementation phase, what is done vs pending, and known issues for the 4friends-2026 rewrite"
metadata: 
  node_type: memory
  type: project
  originSessionId: aa512491-4986-4ba6-a317-1f5fc9f47079
---

This is a ground-up rewrite of a ColdFusion/MySQL Euro 2024 app. Status as of 2026-05-30.

**Why:** Legacy stack (ColdFusion) was not maintainable. WC2026 is the opportunity to rewrite cleanly.
**How to apply:** Before suggesting new work, check what phase we're in and whether the area is still a stub.

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| Phase 1: Database | ✅ Done | Neon project, Prisma schema, 6 migrations applied |
| Phase 2: Auth | ✅ Done | NextAuth v5, Google OAuth, room selection flow |
| Phase 3: Endpoints | 🔄 Partial | bets, matches, next-match, table, room-statistic live; **standings endpoint pending** |
| Phase 4: Cron Jobs | ⬜ Not started | See cron plan below |
| Phase 5: Cleanup | ⬜ Not started | In-memory stubs still present |

## Planned Cron Jobs (Phase 4)
- Every **5 min**: sync live fixtures (`GET /fixtures?live=all` from api-football)
- Every **10 min**: calculate points (`calc-points`)
- Daily **03:00 UTC**: sync standings (`GET /standings`)
- Deployed via `vercel.json` cron config

## In-Memory Stubs to Replace (Phase 5)
- `/src/db/scores.ts`
- `/src/db/room-statistic.ts`
- `/src/db/world-cup.ts`

These should migrate to Prisma queries. `TableService` is also partly in-memory.

## Known Issues / Gotchas
1. **WC2026 API data gap** — api-football free plan has no WC2026 data yet (as of 2026-04-30). Seed uses manual JSON with placeholder fixture IDs 1–104. Real IDs needed when API publishes (~June 2026). See [[project-constraints]].
2. **Point recalculation** — moved from legacy read-side-effect to background cron job (Phase 4).
3. **Two legacy save implementations** — `suggest.cfc::Save` is canonical in old app (has team code validation). Don't reference the non-canonical one.
4. **UserRoom migration** — `joinRoomAndSetCurrent` in RoomService handles both legacy `currentRoom` field and new UserRoom junction table for backwards compat.
5. **48 teams vs 24** — WC2026 is larger; pre-fill on room join creates ~104 bets per user vs 51 for Euro2024.

## Related Memories
- [[database-schema]]
- [[backend-architecture]]
- [[project-constraints]]

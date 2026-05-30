---
name: backend-architecture
description: "API routes, server actions, services, auth flow, and DB layering for 4friends-2026 backend"
metadata: 
  node_type: memory
  type: project
  originSessionId: aa512491-4986-4ba6-a317-1f5fc9f47079
---

## Layering

```
/src/app/api/*        API route handlers (Next.js Route Handlers)
/src/services/        Business logic + data orchestration
/src/db/              Low-level Prisma queries (some still in-memory stubs — see [[migration-status]])
/src/lib/prisma.ts    Singleton Prisma client
```

## API Routes (`/src/app/api/`)

| Route | Methods | Purpose |
|---|---|---|
| `/api/bets` | GET/POST/DELETE | Load/save/clear user bets for active room |
| `/api/matches` | GET | Upcoming matches in 24h window from next match |
| `/api/next-match` | GET | Next unstarted match + server time (for timer); no-cache |
| `/api/table` | GET | Top 3 + current user row for room leaderboard |
| `/api/room-statistic` | GET | 4 stat sections: Total Score, Exact Hits, Predicted Wins, Avg/Match |
| `/api/admin/rooms` | GET/POST | Admin: list/create rooms (protected by admin cookie) |
| `/api/auth/[...nextauth]` | — | NextAuth Google OAuth handlers |

POST /api/bets throws `BetsLockedError` if match already started.

## Server Actions (`/src/app/`)
- `signInWithGoogle` / `signOutUser` — login/logout
- `joinNewRoom` / `selectRoom` — room management (updates `currentRoom`, calls `unstable_update()` to patch session)

## Services (`/src/services/`)

| Service | Responsibility |
|---|---|
| `UserService` | get/upsert users; handles DB unavailability gracefully |
| `RoomService` | get rooms, join room + set current, create room; handles legacy currentRoom migration |
| `BetsService` | get/save/clear bets; maps winPick to team names |
| `MatchService` | upcoming matches window; next-match timer payload; team flag mapping (aliases: Czechia, Korea Republic, USA) |
| `TableService` | top N + current user row from room scores |
| `RoomStatisticService` | 4 stat sections with tie-aware ranking via Prisma groupBy |
| `GlobalTopService` | cross-room leaderboard (best score per user per metric) |
| `PersonalStatisticService` | user stats + bet history; favorite scores, best day; playoff bonus handling |
| `WorldCupService` | group standings + knockout bracket from finished matches |
| `ScheduleService` | all matches May–July 2026; includes bet status per match if roomId provided |

## Auth Flow

```
Request
  → proxy.ts (Edge middleware)
    → no session → redirect /login
    → session, no current_room → redirect /rooms
    → session + current_room → allow

Google OAuth
  → auth.ts jwt() callback
    → UserService.getUserById(email) → loads current_room into token
  → session callback → adds current_room to session

Room selection (/rooms)
  → selectRoom() server action
    → UserService.addUser(email, {current_room})
    → unstable_update() patches session
    → redirect /
```

Auth config: `/src/auth.config.ts` (providers). Full setup: `/src/auth.ts` (JWT + session callbacks).
Admin access: cookie `COOKIES_KEYS.ADMIN_ACCESS_PATH === PAGES.ADMIN` checked in `/src/lib/admin-access.ts`.

## Error Codes
Defined in `/src/utils/constants.ts`. Key: `BetsLockedError` when match already started.

## Related Memories
- [[database-schema]]
- [[migration-status]]

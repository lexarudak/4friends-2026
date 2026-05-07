# Backend Documentation

> Auto-maintained. Updated whenever the `save` command is run.  
> Last updated: 2026-05-07

---

## Stack

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ |
| Framework | Next.js 16 (App Router, Turbopack)               |
| Language  | TypeScript                                       |
| Auth      | NextAuth v5 (`auth()`, Google + Apple OAuth)     |
| DB client | Prisma 7.8 + `@prisma/adapter-pg`                |
| Database  | Prisma Postgres (`db.prisma.io`)                 |
| Runtime   | Node.js (server), Edge (middleware via middleware.ts) |

---

## Entry points

| File                 | Role                                                   |
| -------------------- | ------------------------------------------------------ |
| `src/middleware.ts`  | Edge middleware — auth guard + redirect logic          |
| `src/auth.ts`        | Full server auth (Prisma-backed jwt/session callbacks) |
| `src/auth.config.ts` | Edge-safe auth config (no Prisma, used by middleware.ts) |
| `src/lib/prisma.ts`  | Prisma singleton client (PrismaPg adapter)             |

---

## API Routes

### `GET /api/matches`

- File: `src/app/api/matches/route.ts`
- Auth: none
- Returns: `Match[]` from `MatchService.getMatches()` (in-memory stub)

---

### `GET /api/bets`

- File: `src/app/api/bets/route.ts`
- Auth: required (email from session)
- Active room: required (from `room_id` cookie)
- Returns: `Bet[]` for current user + room

### `POST /api/bets`

- File: `src/app/api/bets/route.ts`
- Auth: required
- Active room: required
- Body: `{ bets: Bet[] }`
- Action: saves bets via `BetsService.saveBets()`

### `DELETE /api/bets`

- File: `src/app/api/bets/route.ts`
- Auth: required
- Active room: required
- Action: clears bets via `BetsService.clearBets()`

---

### `GET /api/table`

- File: `src/app/api/table/route.ts`
- Auth: required
- Active room: required
- Returns: `ScoreTableData` (top 100 rows) via `TableService.getTopTable()`

---

### `GET /api/admin/rooms`

- File: `src/app/api/admin/rooms/route.ts`
- Auth: admin cookie (`admin_access_path === /admin`)
- Returns: `{ id, name }[]` — all rooms from DB

### `POST /api/admin/rooms`

- File: `src/app/api/admin/rooms/route.ts`
- Auth: admin cookie
- Body: `{ name: string }` (3–15 chars)
- Returns: `{ id, name }` of created room
- Errors: `400 INVALID_ROOM_NAME`, `409 ROOM_ALREADY_EXISTS`, `403 FORBIDDEN`

---

### `GET|POST /api/auth/[...nextauth]`

- File: `src/app/api/auth/[...nextauth]/route.ts`
- Handled by NextAuth v5 `handlers`

---

## Server Actions

### `src/app/login/actions.ts`

| Action             | Description                              |
| ------------------ | ---------------------------------------- |
| `signInWithGoogle` | Initiates Google OAuth, redirects to `/` |
| `signOutUser`      | Signs out, redirects to `/login`         |

### `src/app/rooms/actions.ts`

| Action        | Description                                              |
| ------------- | -------------------------------------------------------- |
| `joinNewRoom` | Validates room exists in DB, upserts user, redirects `/` |
| `selectRoom`  | Upserts user's active room in DB, redirects `/`          |
| `signOutUser` | Signs out, redirects to `/login`                         |

All room actions catch `DbUnavailableError` and return `{ error: string }` instead of crashing.

### `src/app/admin/actions.ts`

| Action        | Description                                         |
| ------------- | --------------------------------------------------- |
| `unlockAdmin` | Validates password, sets `admin_access_path` cookie |
| `lockAdmin`   | Clears admin cookie, redirects to `/`               |

---

## Services

### `UserService` — `src/services/user.service.ts`

| Method        | Description                                  | Storage |
| ------------- | -------------------------------------------- | ------- |
| `getUserById` | Find user by email, returns `DbUser \| null` | Prisma  |
| `addUser`     | Upsert user with current room                | Prisma  |

Exports `DbUnavailableError` — thrown when DB is unreachable (`P1001`, `ECONNREFUSED`).

### `RoomService` — `src/services/room.service.ts`

| Method          | Description                               | Storage |
| --------------- | ----------------------------------------- | ------- |
| `getUserRooms`  | Returns user's current room as `string[]` (safe fallback `[]` on DB errors) | Prisma  |
| `getAllRooms`   | Returns all rooms sorted by name (safe fallback `[]` on DB errors) | Prisma  |
| `getRoomByName` | Find room by name                         | Prisma  |
| `createRoom`    | Create new room                           | Prisma  |

### `BetsService` — `src/services/bets.service.ts`

| Method      | Description              | Storage |
| ----------- | ------------------------ | ------- |
| `getBets`   | Get bets for user+room   | Prisma  |
| `saveBets`  | Save bets for user+room  | Prisma  |
| `clearBets` | Clear bets for user+room | Prisma  |

`getBets` is non-blocking and returns `[]` on DB errors.

### `MatchService` — `src/services/match.service.ts`

| Method       | Description     | Storage   |
| ------------ | --------------- | --------- |
| `getMatches` | Get all matches | In-memory |

⚠️ **Not yet migrated to DB.**

### `TableService` — `src/services/table.service.ts`

| Method        | Description                     | Storage   |
| ------------- | ------------------------------- | --------- |
| `getTopTable` | Returns scored table for a room | In-memory |

⚠️ **Not yet migrated to DB.**

---

## Auth flow

```
User visits page
  └─ proxy.ts (Edge) checks session via authConfig
       ├─ no session → redirect /login
       ├─ session, no current_room → redirect /rooms
       └─ session + current_room → allow

Google OAuth callback
  └─ auth.ts jwt() callback
       └─ UserService.getUserById(email) → load current_room into token

Room selected (/rooms)
  └─ selectRoom() server action
       └─ UserService.addUser(email, { current_room }) → upsert in DB
       └─ unstable_update() → patch session token
       └─ redirect /
```

---

## Error codes

| Code                  | HTTP | Meaning                      |
| --------------------- | ---- | ---------------------------- |
| `UNAUTHORIZED`        | 401  | No valid session             |
| `NO_ACTIVE_ROOM`      | 403  | `room_id` cookie missing     |
| `FORBIDDEN`           | 403  | Not admin                    |
| `INVALID_ROOM_NAME`   | 400  | Room name outside 3–15 chars |
| `ROOM_ALREADY_EXISTS` | 409  | Duplicate room name          |

---

## Shared backend helpers

| File                  | Purpose |
| --------------------- | ------- |
| `src/utils/room.ts`   | Shared room-name normalization and validation (`3..15` chars) for API + UI |
| `src/utils/api-client.ts` | Shared client-side JSON request/error parsing helper |

---

## In-memory stubs (not yet migrated)

| File                           | Used by        |
| ------------------------------ | -------------- |
| `src/db/matches.ts`            | `MatchService` |
| `src/db/scores.ts`             | `TableService` |
| `src/db/rooms.ts`              | _(orphaned)_   |
| `src/db/users.ts`              | _(orphaned)_   |
| `src/db/live-matches.ts`       | _(stub)_       |
| `src/db/global-top.ts`         | _(stub)_       |
| `src/db/personal-statistic.ts` | _(stub)_       |
| `src/db/room-statistic.ts`     | _(stub)_       |
| `src/db/world-cup.ts`          | _(stub)_       |
| `src/db/bet-history.ts`        | _(stub)_       |

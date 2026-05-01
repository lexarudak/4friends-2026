# Database Documentation

> Auto-maintained. Updated whenever the `save` command is run.  
> Last updated: 2026-05-01

---

## Connection

| Property      | Value                                 |
| ------------- | ------------------------------------- |
| Provider      | Prisma Postgres (`db.prisma.io:5432`) |
| Adapter       | `@prisma/adapter-pg` → `PrismaPg`     |
| Schema file   | `prisma/schema.prisma`                |
| Client output | `src/generated/prisma/`               |
| Env var       | `DATABASE_URL` (in `.env`)            |

---

## Schema

```prisma
model Room {
  id    String  @id @default(cuid())
  name  String  @unique
  users User[]
}

model User {
  id          String  @id          // Google email address
  currentRoom String?
  room        Room?   @relation(fields: [currentRoom], references: [name])
}
```

---

## Models

### `Room`

| Column | Type   | Constraints        | Notes                        |
| ------ | ------ | ------------------ | ---------------------------- |
| `id`   | String | PK, cuid()         | Auto-generated               |
| `name` | String | Unique, 3–15 chars | Display name, used as FK key |

Relations: `users User[]` — one room has many users.

### `User`

| Column        | Type   | Constraints | Notes                            |
| ------------- | ------ | ----------- | -------------------------------- |
| `id`          | String | PK          | Google email (from OAuth)        |
| `currentRoom` | String | Optional FK | References `Room.name`, nullable |

Relations: `room Room?` — optional many-to-one with Room.

---

## Migrations

| Migration name                  | Applied | Description        |
| ------------------------------- | ------- | ------------------ |
| `20260501081502_add_user_table` | ✅      | Added `User` model |

Location: `prisma/migrations/`

---

## Prisma client setup

File: `src/lib/prisma.ts`

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient() {
	const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
	return new PrismaClient({ adapter });
}

// Singleton — reuses client across hot reloads in dev
export const prisma = globalThis.prisma ?? createPrismaClient();
```

> ⚠️ Prisma 7 requires an adapter. There is **no `url`** in the datasource block of `schema.prisma`.  
> `prisma studio` must be run with `--url "$DATABASE_URL"` flag.

---

## Access patterns

### User lookup on login

```ts
prisma.user.findUnique({ where: { id: email } });
```

### Upsert user room on room select

```ts
prisma.user.upsert({
	where: { id: email },
	update: { currentRoom: roomName },
	create: { id: email, currentRoom: roomName },
});
```

### Get all rooms (admin list)

```ts
prisma.room.findMany({ orderBy: { name: "asc" } });
```

### Create room (admin)

```ts
prisma.room.create({ data: { name } });
```

### Check room exists (join validation)

```ts
prisma.room.findUnique({ where: { name } });
```

---

## Error handling

`DbUnavailableError` is thrown by `UserService.addUser()` when the DB cannot be reached (`P1001`, `PrismaClientInitializationError`, `ECONNREFUSED`).  
`UserService.getUserById()` silently returns `null` on connectivity failure (non-blocking for auth).

---

## What is NOT yet in the DB (in-memory stubs)

| Data          | Stub file                      | Planned migration |
| ------------- | ------------------------------ | ----------------- |
| Bets          | `src/db/bets.ts`               | Phase 3.2         |
| Matches       | `src/db/matches.ts`            | Phase 3.1         |
| Scores/table  | `src/db/scores.ts`             | Phase 3.3         |
| Standings     | _(not yet implemented)_        | Phase 3.7         |
| Live matches  | `src/db/live-matches.ts`       | —                 |
| Global top    | `src/db/global-top.ts`         | —                 |
| Personal stat | `src/db/personal-statistic.ts` | —                 |
| Room stat     | `src/db/room-statistic.ts`     | —                 |
| World Cup     | `src/db/world-cup.ts`          | —                 |
| Bet history   | `src/db/bet-history.ts`        | —                 |

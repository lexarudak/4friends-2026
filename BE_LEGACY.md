# Legacy Backend Documentation

> ColdFusion (CFML) backend for the 4friends betting app (Euro 2024 edition).  
> Tech stack: **Adobe ColdFusion**, **MySQL 8**, **api-football.com v3**.  
> CORS is locked to `https://gtcs.quest`. Auth is cookie-based (`TOKEN`).

---

## 1. Application Config (`Application.cfc`)

| Setting | Value |
|---|---|
| App name | `restgtcs` |
| Session timeout | ~1 hour |
| App timeout | ~13 hours |
| Database | MySQL via JDBC — `jdbc:mysql://4friends_mysql:3306/4friends` |
| Datasource alias | `gtcs` / `application.datasource` |
| DB user | `4friends_CF` |
| CORS origin | `https://gtcs.quest` |

### Session variables (cleared on session start)
```
session.auth.isLoggedIn  = false
session.auth.ID          = ""
session.auth.Username    = ""
session.auth.UserEmail   = ""
session.auth.Password    = ""
session.auth.Level       = ""
session.auth.lastError   = ""
```

---

## 2. Authentication

### How it works
- No JWT. Tokens are SHA-256 hashes stored in the DB table `userTokens`.
- After login a cookie named `TOKEN` is set (domain `4friends.live`, expiry 1-2 months).
- Every protected endpoint reads `COOKIE.TOKEN`, validates it against `userTokens`, and rejects expired ones.

### Token generation
```
token = SHA256( UUID + "_" + timestamp + "_" + accountUniqueID )
```

---

## 3. Endpoints

All endpoints are ColdFusion components (`*.cfc`) invoked via the ColdFusion remote URL pattern:  
`/cfc/<ComponentName>.cfc?method=<functionName>`

---

### 3.1 `cfc/loginUserMain.cfc` → `loginUser`

**Purpose:** Authenticate a user and issue a session token cookie.

**Method:** POST (JSON body)  
**Auth required:** No

**Request body:**
```json
{ "email": "string", "password": "string" }
```

**Logic:**
1. Deserialise JSON body.
2. Look up `accounts` by `email`.
3. Hash `password + salt` with SHA-256, compare to stored hash.
4. On success: insert into `userTokens`, set `TOKEN` cookie.

**Response (success):**
```json
{ "SUCCESS": true, "MESSAGE": "Login successful", "TOKEN": "...", "ACCESSLEVEL": 1 }
```

**Response (failure):**
```json
{ "SUCCESS": false, "MESSAGE": "Invalid password", "ERRORFIELD": "password" }
```

> `cfc/loginUser.cfc` is an older/duplicate version of the same logic (no domain on cookie, slightly different validation flow).

---

### 3.2 `cfc/registerUser.cfc` → `registerUser`

**Purpose:** Register a new user and assign them to a room.

**Method:** POST (JSON body)  
**Auth required:** No

**Request body:**
```json
{ "login": "string", "email": "string", "password": "string", "room": "string" }
```

**Logic:**
1. Validate required fields.
2. Check for duplicate username/email in `accounts`.
3. Validate room exists in `rooms` and has capacity.
4. Insert into `accounts` (password hashed with AES-generated salt).
5. Insert into `userRooms` (user ↔ room relation).
6. Insert into `totalPoints` (starting at 0 points).
7. Pre-populate `allBetsEuro2024` with empty bets for all existing matches.

**Response (success):**
```json
{ "success": true, "message": "Registration success" }
```

---

### 3.3 `getUserInfo.cfc` → `getUserInfo`

**Purpose:** Return the current user's profile and room list.

**Method:** GET  
**Auth required:** Yes (cookie `TOKEN`)

**Response (success):**
```json
{
  "success": true,
  "userid": 42,
  "data": {
    "username": "john",
    "activeroom": 3,
    "rooms": { "1": "Room Alpha", "3": "Room Beta" }
  }
}
```

**Queries used:** `userTokens`, `accounts`, `userRooms`, `rooms`

---

### 3.4 `cfc/getNextMatches.cfc` → `getNextMatches`

**Purpose:** Get matches scheduled in the next 48 hours with the user's current bets.

**Method:** GET  
**Auth required:** Yes (cookie `TOKEN`)

**Response (success):**
```json
{
  "SUCCESS": true,
  "DATA": {
    "101": {
      "USERID": 42,
      "MATCHID": 101,
      "INFO": "Group A",
      "TIME": "2024-06-15 18:00:00",
      "SERVERTIME": "...",
      "EXTRA": false,
      "WINNER": "FRA",
      "TEAM1": { "CODE": "FRA", "SCORE": 2 },
      "TEAM2": { "CODE": "GER", "SCORE": 1 }
    }
  }
}
```

**Queries used:** `userTokens`, `accounts (activeroomID)`, `allMatchesEuro2024`, `allBetsEuro2024`

---

### 3.5 `cfc/getUserBets.cfc` → `getUsersBets`

**Purpose:** Get all matches with all users' bets for the active room. Also **recalculates points** on every call (locked UPDATE).

**Method:** POST (JSON body)  
**Auth required:** Yes (cookie `TOKEN`)

**Request body:**
```json
{ "from": "2024-06-01", "to": "2024-07-31" }
```
> Note: date filtering is currently commented out in the query.

**Side effects (on every call):**
- Updates `allBetsEuro2024.points_match` and `points_match_extra` for all finished/live matches.
- Recalculates `totalPoints.points` for all users.

**Scoring rules (points_match):**
| Condition | Points |
|---|---|
| Exact score | 3 |
| Correct goal difference (not exact) | 2 |
| Correct winner only | 1 |
| Wrong | 0 |
| Correct extra-time winner (`points_match_extra`) | +2 |

**Response structure per match:**
```json
{
  "MATCHID: 101": {
    "TEAM1": { "CODE": "FRA", "SCORE": 2 },
    "TEAM2": { "CODE": "GER", "SCORE": 1 },
    "INFO": "Group A",
    "TIME": "...",
    "EXTRA": false,
    "WINNER": "FRA",
    "STATUS": { "SHORT": "FT", "LONG": "Match Finished", "TYPE": "finished" },
    "PERIODS": { "PERIODS_FIRST": 45, "PERIODS_SECOND": 90, "SERVER_TIME": "..." },
    "USER BETS": [
      {
        "USERNAME": "john",
        "TEAM1": { "CODE": "FRA", "SCORE": 2 },
        "TEAM2": { "CODE": "GER", "SCORE": 1 },
        "WINNER": "FRA",
        "POINTS": 3,
        "POINTS_EXTRA": 0
      }
    ]
  }
}
```

**Queries used:** `userTokens`, `accounts`, `allMatchesEuro2024`, `allBetsEuro2024`, `apiData`, `fixturesStatus`

---

### 3.6 `cfc/Save.cfc` → `SaveAndGetMatches`  &  `cfc/suggest.cfc` → `Save`

Two components implement (slightly different versions of) the same save-bets flow.  
`suggest.cfc::Save` is the **newer/canonical** version.

**Purpose:** Save/update one or more bets, then return the next-48h matches.

**Method:** POST (JSON body)  
**Auth required:** Yes (cookie `TOKEN`)

**Request body:**
```json
{
  "data": [
    {
      "userid": 42,
      "matchid": 101,
      "team1": { "code": "FRA", "score": 2 },
      "team2": { "code": "GER", "score": 1 },
      "winner": "FRA"
    }
  ]
}
```

**Validation:**
- Token must be valid.
- `data[].userid` must match the authenticated user (anti-cheat).
- Match must not have started yet (`datetime > NOW()`).
- Team codes must match `allMatchesEuro2024` (suggest.cfc version only).
- Winner must be consistent with scores (draw + extra allowed).

**Logic:** UPSERT into `allBetsEuro2024` per bet item, then return next-48h matches (same shape as `getNextMatches`).

---

### 3.7 `cfc/getTotalPoints.cfc` → `getTotalPoints`

**Purpose:** Return the leaderboard for the user's active room, plus global stats.

**Method:** GET  
**Auth required:** Yes (cookie `TOKEN`)

**Response:**
```json
{
  "success": true,
  "data": {
    "mainTable":  [ { "username": "john", "points": 42 } ],
    "topAll":     [ { "username": "john", "points": 55 } ],
    "exact":      [ { "username": "john", "points": 12 } ],
    "wins":       [ { "username": "john", "points": 30 } ],
    "average":    [ { "username": "john", "points": "1.75" } ]
  }
}
```

| Key | Description |
|---|---|
| `mainTable` | Points in current active room |
| `topAll` | Max points across all rooms (global top) |
| `exact` | Count of exact-score predictions |
| `wins` | Count of matches with at least 1 point |
| `average` | Average points per played match |

---

### 3.8 `cfc/getStandings.cfc` → `getStandings`

**Purpose:** Return cached tournament group standings (raw JSON string from external API).

**Method:** GET  
**Auth required:** No

**Response:**
```json
{ "SUCCESS": true, "DATA": "<raw json string from standingsData table>" }
```

---

### 3.9 `cfc/suggest.cfc` → `addRoomUser`

**Purpose:** Add the current user to an additional room.

**Method:** POST (JSON body)  
**Auth required:** Yes (cookie `TOKEN`)

**Request body:**
```json
{ "userid": 42, "roomname": "Room Beta" }
```

**Logic:** Validates room exists, has capacity, user not already in it. Inserts into `userRooms`, `totalPoints`, pre-fills `allBetsEuro2024`.

---

### 3.10 `cfc/suggest.cfc` → `changeActiveRoom`

**Purpose:** Switch the user's active room.

**Method:** POST (JSON body)  
**Auth required:** Yes (cookie `TOKEN`)

**Request body:**
```json
{ "userid": 42, "roomid": 3 }
```

**Logic:** `UPDATE accounts SET activeroomID = ? WHERE accountUniqueID = ?`

---

### 3.11 `cfc/suggest.cfc` → `getAllMatches`

**Purpose:** Return all matches with their datetime (used for schedule display).

**Method:** GET  
**Auth required:** No

**Response:**
```json
{
  "SUCCESS": true,
  "DATA": [
    { "match_id": 101, "datetime": "2024-06-15 18:00:00", "servertime": "..." }
  ]
}
```

---

### 3.12 `cfc/apiDataUpdate.cfc` → `apiDataUpdate`  (internal / cron)

**Purpose:** Triggered by scheduler. Checks if any past matches are not yet "Match Finished" and, if so, calls `connectorapi::getFixturesEuro2024` to refresh from the external API.

---

### 3.13 `cfc/connectorapi.cfc` — External API integration

| Function | Purpose |
|---|---|
| `getFixturesEuro2024` | Fetch all Euro 2024 fixture results from api-football.com, upsert into `apiData`, sync scores/winner into `allMatchesEuro2024` |
| `getStandingsEuro2024` | Fetch group standings, store raw JSON into `standingsData` |
| `processFixturesData` | Helper: parse fixture response, resolve winner team code via `countryCodeMapping`, upsert into `apiData` |

**External API:** `https://v3.football.api-sports.io`  
**League ID:** `4` (UEFA Euro), **Season:** `2024`

---

## 4. Database Schema

Derived from SQL queries across all components.

---

### `accounts`

| Column | Type | Notes |
|---|---|---|
| `accountUniqueID` | INT PK AUTO | User ID |
| `email` | VARCHAR | Unique |
| `username` | VARCHAR | Unique display name |
| `password` | VARCHAR | SHA-256 hash |
| `salt` | VARCHAR | AES-generated random salt |
| `status` | INT | 1 = active |
| `accesslevel` | INT | Role (1 = user, higher = admin) |
| `createdDate` | TIMESTAMP | |
| `activeroomID` | INT FK → rooms.id | Currently selected room |

---

### `userTokens`

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO | |
| `userID` | INT FK → accounts | |
| `token` | VARCHAR | SHA-256 hash |
| `expirationDate` | TIMESTAMP | |
| `ip` | VARCHAR | Client IP at login |
| `browser` | VARCHAR | User-Agent at login |

---

### `rooms`

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO | |
| `name` | VARCHAR | Human-readable room name |
| `capacity` | INT | Max number of users |

---

### `userRooms`

| Column | Type | Notes |
|---|---|---|
| `userID` | INT FK → accounts | |
| `roomID` | INT FK → rooms | |

Composite PK implied (userID, roomID).

---

### `allMatchesEuro2024`

| Column | Type | Notes |
|---|---|---|
| `match_id` | INT PK | Matches api-football fixture ID |
| `Team1` | VARCHAR | Home team country code (e.g. `FRA`) |
| `Team2` | VARCHAR | Away team country code |
| `GoalsTeam1` | INT | Synced from `apiData` |
| `GoalsTeam2` | INT | Synced from `apiData` |
| `winner` | VARCHAR | Country code or `"draw"` — synced from `apiData` |
| `extra` | TINYINT | 1 = extra-time possible (knockout match) |
| `datetime` | TIMESTAMP | Match kick-off time (UTC) |
| `info` | VARCHAR | Group / round label (e.g. "Group A") |

---

### `allBetsEuro2024`

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO | |
| `room_id` | INT FK → rooms | |
| `player_id` | INT FK → accounts | |
| `match_id` | INT FK → allMatchesEuro2024 | |
| `Team1` | VARCHAR | Predicted home team code |
| `GoalsTeam1` | INT NULL | Predicted home goals |
| `GoalsTeam2` | INT NULL | Predicted away goals |
| `Team2` | VARCHAR | Predicted away team code |
| `winner` | VARCHAR NULL | Predicted winner code (for knockout) |
| `points_match` | INT | Calculated: 0/1/2/3 |
| `points_match_extra` | INT | Calculated: 0 or 2 |
| `createdDate` | TIMESTAMP | |
| `createdBy` | VARCHAR | username at insert time |
| `updatedDate` | TIMESTAMP NULL | |
| `updatedBy` | VARCHAR NULL | |

Unique key implied on `(room_id, player_id, match_id)`.

---

### `totalPoints`

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO | |
| `userID` | INT FK → accounts | |
| `username` | VARCHAR | Denormalised for query speed |
| `points` | INT | Total points, recalculated on every `getUsersBets` call |
| `roomID` | INT FK → rooms | |

---

### `apiData`

Live fixture data synced from api-football.com.

| Column | Type | Notes |
|---|---|---|
| `match_id` | INT PK | = `allMatchesEuro2024.match_id` |
| `fixture_id` | BIGINT | api-football fixture ID |
| `fixture_date` | TIMESTAMP | |
| `status` | VARCHAR | e.g. `"Match Finished"`, `"In Play"`, `"Not Started"` |
| `league_name` | VARCHAR | |
| `league_season` | INT | |
| `league_round` | VARCHAR | |
| `team_home_name` | VARCHAR | Full name from API |
| `team_away_name` | VARCHAR | Full name from API |
| `goals_home` | INT | |
| `goals_away` | INT | |
| `halftime_home` | INT | |
| `halftime_away` | INT | |
| `fulltime_home` | INT | |
| `fulltime_away` | INT | |
| `extratime_home` | INT | |
| `extratime_away` | INT | |
| `penalty_home` | INT | |
| `penalty_away` | INT | |
| `periods_first` | INT | Minutes played in first half (or 45 if done) |
| `periods_second` | INT | Minutes played in second half |
| `winner` | VARCHAR | Country code resolved via `countryCodeMapping` |

---

### `fixturesStatus`

Lookup table mapping api-football long status strings to short codes and types.

| Column | Type | Notes |
|---|---|---|
| `long` | VARCHAR PK | e.g. `"Match Finished"` |
| `short` | VARCHAR | e.g. `"FT"` |
| `type` | VARCHAR | e.g. `"finished"`, `"in_play"`, `"scheduled"` |

---

### `standingsData`

Single-row table holding the cached standings JSON.

| Column | Type |
|---|---|
| `jsonstring` | LONGTEXT |

---

### `countryCodeMapping`

Maps full team names (from api-football) to 3-letter country codes used in `allMatchesEuro2024`.

| Column | Type |
|---|---|
| `name` | VARCHAR PK (full name, e.g. `"France"`) |
| `code` | VARCHAR (e.g. `"FRA"`) |

---

## 5. Known Issues / Notes for Migration

- **Point recalculation is a side effect** of `getUsersBets` — every page load writes to the DB. Should be decoupled into a background job or triggered explicitly.
- **Two save implementations** (`Save.cfc::SaveAndGetMatches` and `suggest.cfc::Save`) — `suggest.cfc::Save` is the current one with team code validation. The other is stale.
- **Two login implementations** (`loginUser.cfc` vs `loginUserMain.cfc`) — `loginUserMain.cfc` is the live one (sets cookie with domain).
- **`allBetsEuro2024` is pre-populated on registration** with empty rows for every match — relies on this existing row for UPDATE vs INSERT logic.
- **No logout endpoint** — tokens expire naturally, no server-side invalidation.
- **Hardcoded API key** in `connectorapi.cfc` — must be moved to env vars.
- **`getUserBets` date filter** (`from`/`to`) is commented out — all matches always returned.
- **Table/column names are inconsistent** — some use camelCase, some snake_case, some PascalCase.
- **`totalPoints.username` is denormalised** — needs to be kept in sync with `accounts.username`.

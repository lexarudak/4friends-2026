# External API: api-football v3

**Docs:** https://www.api-football.com/documentation-v3  
**Base URL:** `https://v3.football.api-sports.io`  
**Auth header:** `x-rapidapi-key: <API_KEY>`  
**Env var:** `process.env.FOOTBALL_API_KEY`

> ⚠️ The API key is currently hardcoded in `be/cfc/connectorapi.cfc` — must be moved to `.env` before migration.

---

## Free Plan Limits

| Limit             | Value          |
| ----------------- | -------------- |
| Requests / day    | **100**        |
| Requests / minute | 10             |
| Historical data   | ✅             |
| All leagues       | ✅ (read-only) |

> 100 req/day is the hard constraint that drives all cron design decisions.

---

## Account Info

| Field          | Value                                |
| -------------- | ------------------------------------ |
| Plan           | Free (active until 2027-04-30)       |
| Requests today | tracked at runtime via `GET /status` |
| Daily limit    | 100                                  |

## Tournament: World Cup 2026

**League ID `1`** = FIFA World Cup  
**Season `2026`** = World Cup 2026  
**Tournament dates:** 2026-06-11 → 2026-07-19  
**Teams:** 48 (expanded format — first time)  
**Estimated fixtures:** ~104 matches

> Previous app targeted **Euro 2024** (league `4`, season `2024`). All legacy DB tables and seed data were for that tournament. The new implementation targets **WC 2026**.

### ⚠️ Free Plan Limitations for WC 2026 (verified April 30, 2026)

| Endpoint                              | Status       | Notes                                                                   |
| ------------------------------------- | ------------ | ----------------------------------------------------------------------- |
| `GET /fixtures?league=1&season=2026`  | ❌ 0 results | Fixtures not yet published by API                                       |
| `GET /teams?league=1&season=2026`     | ❌ 0 results | Teams not yet available                                                 |
| `GET /standings?league=1&season=2026` | ❌ Error     | `"Free plans do not have access to this season, try from 2022 to 2024"` |

**Implication:** The seed strategy from the Euro 2024 migration (fetch everything from API) **will not work yet** for WC 2026. Fixtures, teams and standings must be seeded **manually or from a different source** until the API populates them. Poll `GET /fixtures?league=1&season=2026` periodically — data should appear closer to June 2026.

### Legacy usage (Euro 2024 — for reference only)

| Endpoint         | Params                                               | Purpose                             |
| ---------------- | ---------------------------------------------------- | ----------------------------------- |
| `GET /fixtures`  | `league=4&season=2024&from=2024-06-14&to=2024-07-14` | Fetch all Euro 2024 fixture results |
| `GET /standings` | `league=4&season=2024`                               | Fetch group standings               |

---

## Available Endpoints (relevant to this app)

| Endpoint                  | What it provides                                          |
| ------------------------- | --------------------------------------------------------- |
| `GET /fixtures`           | Full fixture data: scores, status, periods, ET, penalties |
| `GET /fixtures?live=all`  | **Live matches only** — most efficient for real-time sync |
| `GET /fixtures?id=`       | Single fixture by ID                                      |
| `GET /fixtures?status=FT` | All finished matches                                      |
| `GET /standings`          | Group standings table with points, W/D/L, GF/GA           |
| `GET /teams`              | Team info, country, logo URL                              |
| `GET /leagues`            | League / tournament metadata                              |
| `GET /timezone`           | Available timezones                                       |

---

## Fixture Response Shape (actual from API)

```json
{
	"fixture": {
		"id": 1145509,
		"referee": "C. Turpin",
		"timezone": "UTC",
		"date": "2024-06-14T19:00:00+00:00",
		"timestamp": 1718391600,
		"periods": {
			"first": 1718391600,
			"second": 1718395200
		},
		"venue": {
			"id": 700,
			"name": "Allianz Arena",
			"city": "München"
		},
		"status": {
			"long": "Match Finished",
			"short": "FT",
			"elapsed": 90,
			"extra": null
		}
	},
	"league": {
		"id": 4,
		"name": "Euro Championship",
		"country": "World",
		"logo": "https://media.api-sports.io/football/leagues/4.png",
		"flag": null,
		"season": 2024,
		"round": "Group A - 1",
		"standings": true
	},
	"teams": {
		"home": {
			"id": 25,
			"name": "Germany",
			"logo": "https://media.api-sports.io/football/teams/25.png",
			"winner": true
		},
		"away": {
			"id": 1108,
			"name": "Scotland",
			"logo": "https://media.api-sports.io/football/teams/1108.png",
			"winner": false
		}
	},
	"goals": { "home": 5, "away": 1 },
	"score": {
		"halftime": { "home": 3, "away": 0 },
		"fulltime": { "home": 5, "away": 1 },
		"extratime": { "home": null, "away": null },
		"penalty": { "home": null, "away": null }
	}
}
```

> ⚠️ `fixture.periods.first` and `fixture.periods.second` are **Unix timestamps** of when each half started — NOT minutes elapsed. The legacy `periods_first/periods_second` columns store these raw values. In migration, store as-is or convert to ISO string.

---

## Standings Response Shape (actual from API)

```json
{
  "league": {
    "id": 4,
    "name": "Euro Championship",
    "season": 2024,
    "standings": [
      [
        {
          "rank": 1,
          "team": { "id": 25, "name": "Germany", "logo": "..." },
          "points": 7,
          "goalsDiff": 6,
          "group": "Group A",
          "form": "DWW",
          "status": "same",
          "description": "Promotion - Euro (Play Offs: 1/8-finals)",
          "all": { "played": 3, "win": 2, "draw": 1, "lose": 0, "goals": { "for": 8, "against": 2 } },
          "home": { "played": null, ... },
          "away": { "played": null, ... },
          "update": "2024-07-17T00:00:00+00:00"
        }
      ]
    ]
  }
}
```

> `standings` is an **array of arrays** — each inner array is one group. `home`/`away` splits are `null` for international tournaments.

---

## All 24 Euro 2024 Teams (actual from API)

> ⚠️ The API provides its own `code` field — the legacy `countryCodeMapping` table can be **replaced** by seeding teams from this endpoint directly. No manual mapping needed.

| API ID | Name           | Code | Logo URL                                              |
| ------ | -------------- | ---- | ----------------------------------------------------- |
| 1      | Belgium        | BEL  | `https://media.api-sports.io/football/teams/1.png`    |
| 2      | France         | FRA  | `https://media.api-sports.io/football/teams/2.png`    |
| 3      | Croatia        | CRO  | `https://media.api-sports.io/football/teams/3.png`    |
| 9      | Spain          | SPA  | `https://media.api-sports.io/football/teams/9.png`    |
| 10     | England        | ENG  | `https://media.api-sports.io/football/teams/10.png`   |
| 14     | Serbia         | SER  | `https://media.api-sports.io/football/teams/14.png`   |
| 15     | Switzerland    | SWI  | `https://media.api-sports.io/football/teams/15.png`   |
| 21     | Denmark        | DEN  | `https://media.api-sports.io/football/teams/21.png`   |
| 24     | Poland         | POL  | `https://media.api-sports.io/football/teams/24.png`   |
| 25     | Germany        | GER  | `https://media.api-sports.io/football/teams/25.png`   |
| 27     | Portugal       | POR  | `https://media.api-sports.io/football/teams/27.png`   |
| 768    | Italy          | ITA  | `https://media.api-sports.io/football/teams/768.png`  |
| 769    | Hungary        | HUN  | `https://media.api-sports.io/football/teams/769.png`  |
| 770    | Czech Republic | CZE  | `https://media.api-sports.io/football/teams/770.png`  |
| 772    | Ukraine        | UKR  | `https://media.api-sports.io/football/teams/772.png`  |
| 773    | Slovakia       | SLO  | `https://media.api-sports.io/football/teams/773.png`  |
| 774    | Romania        | ROM  | `https://media.api-sports.io/football/teams/774.png`  |
| 775    | Austria        | AUS  | `https://media.api-sports.io/football/teams/775.png`  |
| 777    | Türkiye        | TUR  | `https://media.api-sports.io/football/teams/777.png`  |
| 778    | Albania        | ALB  | `https://media.api-sports.io/football/teams/778.png`  |
| 1091   | Slovenia       | SLO  | `https://media.api-sports.io/football/teams/1091.png` |
| 1104   | Georgia        | GEO  | `https://media.api-sports.io/football/teams/1104.png` |
| 1108   | Scotland       | SCO  | `https://media.api-sports.io/football/teams/1108.png` |
| 1118   | Netherlands    | NET  | `https://media.api-sports.io/football/teams/1118.png` |

> ⚠️ **Code collisions:** Both Slovakia (773) and Slovenia (1091) have code `SLO`. Handle explicitly in seed data.

---

## All 51 Euro 2024 Fixtures (actual from API)

| fixture_id | Date       | Round          | Home           | Score | Away           | Status |
| ---------- | ---------- | -------------- | -------------- | ----- | -------------- | ------ |
| 1145509    | 2024-06-14 | Group A - 1    | Germany        | 5-1   | Scotland       | FT     |
| 1145510    | 2024-06-15 | Group A - 1    | Hungary        | 1-3   | Switzerland    | FT     |
| 1145511    | 2024-06-15 | Group B - 1    | Spain          | 3-0   | Croatia        | FT     |
| 1145512    | 2024-06-15 | Group B - 1    | Italy          | 2-1   | Albania        | FT     |
| 1189846    | 2024-06-16 | Group D - 1    | Poland         | 1-2   | Netherlands    | FT     |
| 1145513    | 2024-06-16 | Group C - 1    | Slovenia       | 1-1   | Denmark        | FT     |
| 1145514    | 2024-06-16 | Group C - 1    | Serbia         | 0-1   | England        | FT     |
| 1189847    | 2024-06-17 | Group E - 1    | Romania        | 3-0   | Ukraine        | FT     |
| 1145516    | 2024-06-17 | Group E - 1    | Belgium        | 0-1   | Slovakia       | FT     |
| 1145515    | 2024-06-17 | Group D - 1    | Austria        | 0-1   | France         | FT     |
| 1189848    | 2024-06-18 | Group F - 1    | Türkiye        | 3-1   | Georgia        | FT     |
| 1145517    | 2024-06-18 | Group F - 1    | Portugal       | 2-1   | Czech Republic | FT     |
| 1145520    | 2024-06-19 | Group B - 2    | Croatia        | 2-2   | Albania        | FT     |
| 1145519    | 2024-06-19 | Group A - 2    | Germany        | 2-0   | Hungary        | FT     |
| 1145518    | 2024-06-19 | Group A - 2    | Scotland       | 1-1   | Switzerland    | FT     |
| 1145523    | 2024-06-20 | Group C - 2    | Slovenia       | 1-1   | Serbia         | FT     |
| 1145522    | 2024-06-20 | Group C - 2    | Denmark        | 1-1   | England        | FT     |
| 1145521    | 2024-06-20 | Group B - 2    | Spain          | 1-0   | Italy          | FT     |
| 1189849    | 2024-06-21 | Group E - 2    | Slovakia       | 1-2   | Ukraine        | FT     |
| 1189850    | 2024-06-21 | Group D - 2    | Poland         | 1-3   | Austria        | FT     |
| 1145524    | 2024-06-21 | Group D - 2    | Netherlands    | 0-0   | France         | FT     |
| 1189851    | 2024-06-22 | Group F - 2    | Georgia        | 1-1   | Czech Republic | FT     |
| 1145526    | 2024-06-22 | Group F - 2    | Türkiye        | 0-3   | Portugal       | FT     |
| 1145525    | 2024-06-22 | Group E - 2    | Belgium        | 2-0   | Romania        | FT     |
| 1145527    | 2024-06-23 | Group A - 3    | Switzerland    | 1-1   | Germany        | FT     |
| 1145528    | 2024-06-23 | Group A - 3    | Scotland       | 0-1   | Hungary        | FT     |
| 1145529    | 2024-06-24 | Group B - 3    | Croatia        | 1-1   | Italy          | FT     |
| 1145530    | 2024-06-24 | Group B - 3    | Albania        | 0-1   | Spain          | FT     |
| 1189852    | 2024-06-25 | Group D - 3    | France         | 1-1   | Poland         | FT     |
| 1145533    | 2024-06-25 | Group D - 3    | Netherlands    | 2-3   | Austria        | FT     |
| 1145531    | 2024-06-25 | Group C - 3    | England        | 0-0   | Slovenia       | FT     |
| 1145532    | 2024-06-25 | Group C - 3    | Denmark        | 0-0   | Serbia         | FT     |
| 1189853    | 2024-06-26 | Group E - 3    | Ukraine        | 0-0   | Belgium        | FT     |
| 1145534    | 2024-06-26 | Group E - 3    | Slovakia       | 1-1   | Romania        | FT     |
| 1145535    | 2024-06-26 | Group F - 3    | Czech Republic | 1-2   | Türkiye        | FT     |
| 1189854    | 2024-06-26 | Group F - 3    | Georgia        | 2-0   | Portugal       | FT     |
| 1212958    | 2024-06-29 | Round of 16    | Switzerland    | 2-0   | Italy          | FT     |
| 1214156    | 2024-06-29 | Round of 16    | Germany        | 2-0   | Denmark        | FT     |
| 1215074    | 2024-06-30 | Round of 16    | England        | 2-1   | Slovakia       | AET    |
| 1215075    | 2024-06-30 | Round of 16    | Spain          | 4-1   | Georgia        | FT     |
| 1215073    | 2024-07-01 | Round of 16    | France         | 1-0   | Belgium        | FT     |
| 1215076    | 2024-07-01 | Round of 16    | Portugal       | 0-0   | Slovenia       | PEN    |
| 1215077    | 2024-07-02 | Round of 16    | Romania        | 0-3   | Netherlands    | FT     |
| 1215078    | 2024-07-02 | Round of 16    | Austria        | 1-2   | Türkiye        | FT     |
| 1219688    | 2024-07-05 | Quarter-finals | Spain          | 2-1   | Germany        | AET    |
| 1219959    | 2024-07-05 | Quarter-finals | Portugal       | 0-0   | France         | PEN    |
| 1219689    | 2024-07-06 | Quarter-finals | England        | 1-1   | Switzerland    | PEN    |
| 1220308    | 2024-07-06 | Quarter-finals | Netherlands    | 2-1   | Türkiye        | FT     |
| 1225853    | 2024-07-09 | Semi-finals    | Spain          | 2-1   | France         | FT     |
| 1227539    | 2024-07-10 | Semi-finals    | Netherlands    | 1-2   | England        | FT     |
| 1232551    | 2024-07-14 | Final          | Spain          | 2-1   | England        | FT     |

---

## Fixture Status Codes

| Short  | Long                              | Type      |
| ------ | --------------------------------- | --------- |
| `NS`   | Not Started                       | scheduled |
| `1H`   | First Half                        | in_play   |
| `HT`   | Halftime                          | in_play   |
| `2H`   | Second Half                       | in_play   |
| `ET`   | Extra Time                        | in_play   |
| `BT`   | Break Time (before ET)            | in_play   |
| `P`    | Penalty In Progress               | in_play   |
| `FT`   | Match Finished                    | finished  |
| `AET`  | Match Finished (After Extra Time) | finished  |
| `PEN`  | Match Finished (Penalties)        | finished  |
| `SUSP` | Match Suspended                   | other     |
| `INT`  | Match Interrupted                 | other     |
| `PST`  | Match Postponed                   | other     |
| `CANC` | Match Cancelled                   | other     |
| `ABD`  | Match Abandoned                   | other     |
| `AWD`  | Technical Loss                    | other     |
| `WO`   | WalkOver                          | other     |

---

## Cron Strategy for Migration

```
Trigger: every 2 minutes
Condition: only if any match has datetime <= NOW() AND status NOT IN (finished types)
Action: GET /fixtures?live=all  →  upsert apiData  →  sync allMatches scores/winner

Trigger: once daily at 03:00 UTC
Action: GET /standings?league=1&season=2026  →  overwrite standingsData.jsonstring
```

> ⚠️ Standings endpoint currently returns an error on the free plan for season 2026. Monitor and enable once data becomes available.

**Budget calculation (match day with 3 games):**

- Match duration ~2h = 60 calls × 2/min = 60 calls per match day
- 3 match days/week peak = ~180 calls → exceeds 100/day on heavy days

**Solution:** switch trigger to `every 5 minutes` during live → ~24 calls per 2h match = safe.

---

## Winner Resolution Logic (from legacy)

The API returns `teams.home.winner: true/false/null`. The legacy code resolves this to a **country code** via the `countryCodeMapping` table (full name → 3-letter code, e.g. `"France"` → `"FRA"`).

In the migration, this lookup should be handled in the Prisma sync service, not inlined in the cron route.

---

## Notes for Migration

- **WC 2026 data is not yet available on the free plan** (verified 2026-04-30). Teams, fixtures and standings all return empty. Implement a manual seed path as fallback; switch to API-driven seed once data is published.
- **`countryCodeMapping` table is no longer needed** — the API's `GET /teams` returns a `code` field directly. Seed teams from the API once available.
- ⚠️ **Code collision in Euro 2024 data:** Both Slovakia (`773`) and Slovenia (`1091`) had code `SLO`. Watch for similar issues in WC 2026 team data.
- `fixture.periods.first/second` are **Unix timestamps**, not minutes elapsed.
- `winner` field in API response can be `null` during a live match — always gate on `status.short` before trusting it.
- `GET /fixtures?live=all` returns only currently live matches — use full `/fixtures` with date range for initial DB seed.
- `home`/`away` split stats in standings are always `null` for international tournaments — ignore them.
- Logo URLs follow the pattern `https://media.api-sports.io/football/teams/{id}.png` — can be stored or constructed on the fly.
- WC 2026 has **48 teams** and **~104 matches** (vs 24 teams / 51 matches for Euro 2024) — the bet pre-fill on registration will be significantly larger.

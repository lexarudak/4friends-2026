---
name: project-constraints
description: "External API limits, WC2026 data availability gap, and Vercel constraints for 4friends-2026"
metadata: 
  node_type: memory
  type: project
  originSessionId: aa512491-4986-4ba6-a317-1f5fc9f47079
---

## api-football.com Free Plan Limits
- **100 requests/day** — primary constraint driving all cron job design decisions
- 10 requests/minute rate limit
- These limits mean cron jobs must be carefully batched; avoid any design that makes per-match or per-user API calls

## WC2026 Data Availability Gap
As of **2026-04-30** (verified):
- `GET /fixtures?league=1&season=2026` → 0 results
- `GET /teams?league=1&season=2026` → 0 results
- `GET /standings?league=1&season=2026` → error (free plan restriction)

**Current workaround:** Static seed (`/scripts/seed-wc2026-static.ts`) with manually curated match data from Wikipedia/FIFA December 2025 draw. Fixture IDs are **placeholders 1–104** — NOT real api-football IDs.

**Action required when API publishes (~June 2026):** Run `seed-matches.ts` to fetch real fixture IDs and update all placeholder IDs in the `Match` table. Any `Bet` records linking to old IDs may need remapping.

## Tournament Scale Difference
WC2026 vs legacy Euro 2024 app:
- 48 teams (vs 24) → ~104 matches (vs 51)
- Groups A–L (12 groups, vs 6)
- Knockout from round of 32 (not 16)
- This affects: pre-fill on room join, leaderboard pagination, seeding volume

## Vercel Serverless Constraints
- No long-running processes — all heavy work must be in cron jobs or background functions
- Cron jobs configured in `vercel.json`
- Edge middleware (`proxy.ts`) used for auth redirects — must stay lightweight (no DB calls in edge)

## Related Memories
- [[database-schema]]
- [[migration-status]]
- [[backend-architecture]]

---
name: project-overview
description: "Purpose, tech stack, scoring rules, and deployment of the 4friends-2026 WC2026 betting app"
metadata: 
  node_type: memory
  type: project
  originSessionId: aa512491-4986-4ba6-a317-1f5fc9f47079
---

A multiplayer FIFA World Cup 2026 betting/prediction app. Users join rooms, submit score predictions for each match, earn points based on accuracy, and compete on room-based and global leaderboards.

This is a ground-up rewrite of a legacy Euro 2024 app (ColdFusion/MySQL). The new stack is referenced against the old one to avoid missing features.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Auth | NextAuth v5 beta (Google OAuth only — no email/password) |
| Database | Neon (serverless Postgres) via Prisma 7.8 + `@prisma/adapter-pg` |
| Styling | SCSS Modules + `vars.scss` design tokens (no Tailwind) |
| Forms | Formik 2 |
| Validation | Zod 4 |
| External API | api-football.com v3 (free plan) |
| Deployment | Vercel (serverless + cron jobs via `vercel.json`) |

## Scoring Rules

| Condition | Points |
|---|---|
| Exact score | 3 |
| Correct goal difference (not exact) | 2 |
| Correct winner only | 1 |
| Wrong | 0 |
| Correct extra-time/playoff winner (bonus) | +2 |

Average points = total ÷ all finished matches globally (not per-user match count).

## Pages

`/` home (bets + leaderboard), `/login`, `/rooms` (room selection), `/schedule`, `/world-cup` (bracket), `/room-statistic`, `/personal-statistic`, `/global-top`, `/admin`, `/about` (rules), `/auth-error`, `/dev`

## Related Memories
- [[database-schema]]
- [[backend-architecture]]
- [[frontend-structure]]
- [[migration-status]]
- [[project-constraints]]

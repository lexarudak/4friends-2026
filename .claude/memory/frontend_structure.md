---
name: frontend-structure
description: "Component hierarchy, page list, styling system, and data-fetching patterns for 4friends-2026 frontend"
metadata: 
  node_type: memory
  type: project
  originSessionId: aa512491-4986-4ba6-a317-1f5fc9f47079
---

## Component Hierarchy

```
/src/components/
  features/     Page sections — may fetch own data; mix of server + client
  widgets/      Reusable domain components
  shared/       Generic UI primitives (no domain logic)
  icons/        SVG icon components
```

### Features
- `app-header` — header with user info + nav
- `bets-form` — **client** (Formik); main bet submission form
- `bets-section` — **server**; fetches matches + bets, renders BetsForm
- `conditional-layout` — switches full vs minimal layout by route
- `hero-section` — tournament info banner
- `join-room-form` — room joining
- `live-section` — **server**; live match display
- `paginated-table` — table with pagination
- `schedule-section` — match schedule display
- `top-table` — **client**; polls `/api/table` for top 3 leaderboard

### Widgets
- `bet-history-list`, `bet-item` — past bets with results
- `group-standing` — group table in tournament view
- `header-info-bar`, `header-nav-bar` — header sub-components
- `match-card` — score inputs + winner radio for one match
- `next-bets-list` — upcoming bets quick view
- `room-item` — room selection button
- `schedule-match-card` — match card with live status
- `score-table` — reusable leaderboard/stats table
- `timer` — **client**; countdown synced to server clock (`/api/next-match`)

### Shared UI
`button` (solid/inline/outline variants, href support, loading state), `close-button`, `date-range-picker`, `page-container`, `page-title`, `preserved-query-link` (keeps query params), `score-input` (0–99 number), `section-label`, `section`, `shadow-card`, `stat-card`, `team-badge`

## Styling System

- **SCSS Modules** per component (`.module.scss`)
- **Design tokens**: `/src/styles/vars.scss` (colors, spacing, typography, shadows, animation, breakpoints)
  - Colors: neutrals 50–950, primary blue `#0a84ff`, green `#30d158`, red `#f43056`, yellow `#ff9f0a`; semantic tokens; 6 points-color stops
  - Breakpoints: `$screen-phone: 450px`, `$screen-tablet: 768px`, `$screen-desktop: 1200px`
  - Animation: `duration-fast 150ms`, `duration-base 200ms`, `duration-slow 520ms`
- **Mixins**: `/src/styles/mixins.scss` (`container`, `pageContainer`)
- **Global resets**: `/src/styles/globals.scss`, `normalize.scss`
- Dark theme by default (neutral-950 bg)
- No Tailwind, no CSS-in-JS

## Data Fetching Patterns

**Server Components** (default): fetch at render time via services → pass as props
**Client Components** (explicit `"use client"`):
- `BetsForm` → Formik for local form state → POST `/api/bets`
- `TopTable` → `useState` + `useEffect` polls `/api/table`
- `Timer` → `useState` interval, synced via `/api/next-match`

Client-side fetch utility: `requestApi()` in `/src/utils/api-client.ts`

## Key Config
- `tsconfig.json`: path alias `@/*` → `./src/*`
- `next.config.ts`: remote image pattern for `lh3.googleusercontent.com` (Google avatars)
- No `vite.config.ts` (Next.js builds)

## Related Memories
- [[project-overview]]
- [[backend-architecture]]

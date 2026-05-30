# Memory Index — 4friends-2026

- [Project Overview](project_overview.md) — App purpose, tech stack (Next.js 16, Prisma, Neon, NextAuth v5), scoring rules, page list
- [Database Schema](database_schema.md) — Prisma models (Room/User/UserRoom/Match/Bet), migrations, seeding strategy, placeholder fixture IDs
- [Backend Architecture](backend_architecture.md) — API routes, server actions, 10 services, auth flow (Edge→JWT→session), DB layering
- [Frontend Structure](frontend_structure.md) — Component hierarchy (features/widgets/shared), SCSS design tokens, data-fetching patterns
- [Migration Status](migration_status.md) — Phase tracker (DB✅ Auth✅ Endpoints🔄 Cron⬜ Cleanup⬜), known issues, in-memory stubs to replace
- [Project Constraints](project_constraints.md) — api-football 100 req/day limit, WC2026 data gap (placeholder IDs 1–104), tournament scale (48 teams/104 matches)
- [Tournaments & DB Connection](tournaments_and_db.md) — multi-tournament isolation (Room/Match.tournament), Accelerate connection setup, import-fixture script

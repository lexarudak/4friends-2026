This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Copy environment template first:

```bash
cp .env.example .env.local
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Local vs Deploy Database Strategy

The app uses one Prisma schema and one Prisma client in all environments.
Only `DATABASE_URL` changes between local and deployment.

- Local development: point `DATABASE_URL` to local Postgres.
- Deploy (Vercel/production): point `DATABASE_URL` to production Postgres.

This keeps service code identical while isolating data by environment.

### Safe DB Commands

```bash
# local development migrations
npm run db:migrate:dev

# production/deploy migrations
npm run db:migrate:deploy

# seed from football API (local DB only, guarded)
npm run seed:matches:local

# seed static WC 2026 data (local DB only, guarded)
npm run seed:wc2026:local
```

`seed:*:local` commands run a safety guard and stop if `DATABASE_URL` is not local (`localhost`, `127.0.0.1`, `::1`) or if running in production runtime.

If you intentionally need to seed a non-local database, set:

```bash
ALLOW_NON_LOCAL_SEED=true npm run seed:matches
```

Use this override carefully.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

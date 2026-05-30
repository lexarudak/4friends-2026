import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function normalizeSSLMode(url: string | undefined): string | undefined {
	if (!url) return url;
	try {
		const u = new URL(url);
		const sslmode = u.searchParams.get("sslmode");
		// Only upgrade verify-ca → verify-full.
		// Keep "require" as-is: pg driver maps it to ssl without cert verification,
		// which is what Prisma Postgres (db.prisma.io) expects on Vercel.
		if (sslmode === "verify-ca") {
			u.searchParams.set("sslmode", "verify-full");
		}
		return u.toString();
	} catch {
		return url;
	}
}

// Bound the per-instance connection pool. Serverless spins up many instances;
// an unbounded pool against a connection-limited role exhausts connections fast.
const POOL_MAX = Number(process.env.DB_POOL_MAX ?? 3);

function createPrismaClient() {
	const url = process.env.DATABASE_URL ?? "";

	// Prisma Postgres / Accelerate pooled connection (HTTP) — no TCP connection
	// limit, the right choice for serverless. Used when DATABASE_URL is the
	// `prisma+postgres://...?api_key=...` form.
	if (url.startsWith("prisma://") || url.startsWith("prisma+postgres://")) {
		return new PrismaClient({ accelerateUrl: url });
	}

	// Direct Postgres (local dev / direct TCP) via pg adapter, bounded pool.
	const adapter = new PrismaPg({
		connectionString: normalizeSSLMode(url),
		max: POOL_MAX,
	});
	return new PrismaClient({ adapter });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
	prisma?: ExtendedPrismaClient;
};

export const prisma: ExtendedPrismaClient =
	globalForPrisma.prisma ?? createPrismaClient();

// Cache the singleton in every environment. In serverless this keeps one
// client per warm instance instead of one per module evaluation.
globalForPrisma.prisma = prisma;

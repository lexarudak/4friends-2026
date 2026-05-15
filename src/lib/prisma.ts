import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function normalizeSSLMode(url: string | undefined): string | undefined {
	if (!url) return url;
	try {
		const u = new URL(url);
		const sslmode = u.searchParams.get("sslmode");
		if (
			sslmode === "require" ||
			sslmode === "prefer" ||
			sslmode === "verify-ca"
		) {
			u.searchParams.set("sslmode", "verify-full");
		}
		return u.toString();
	} catch {
		return url;
	}
}

function createPrismaClient() {
	const adapter = new PrismaPg({
		connectionString: normalizeSSLMode(process.env.DATABASE_URL),
	});
	return new PrismaClient({ adapter });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

declare global {
	var prisma: ExtendedPrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = prisma;
}

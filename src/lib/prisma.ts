import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient() {
	const adapter = new PrismaPg({
		connectionString: process.env.DATABASE_URL,
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

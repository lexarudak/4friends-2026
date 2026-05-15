import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

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

const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: normalizeSSLMode(process.env.DATABASE_URL),
	}),
});

async function main() {
	const rooms = await prisma.room.findMany();
	const users = await prisma.user.findMany({
		select: { id: true, name: true, currentRoom: true },
	});
	const betsCount = await prisma.bet.count();
	console.log("rooms:", JSON.stringify(rooms, null, 2));
	console.log("users:", JSON.stringify(users, null, 2));
	console.log("bets count:", betsCount);
}

main()
	.catch(console.error)
	.finally(() => prisma.$disconnect());

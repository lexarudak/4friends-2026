import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
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

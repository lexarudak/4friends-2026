import { config } from "dotenv";
import { resolve } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

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

const adapter = new PrismaPg({
	connectionString: normalizeSSLMode(process.env.DATABASE_URL),
});

const prisma = new PrismaClient({ adapter });

const LOCAL_ROOM_NAME = "local";
const TEST_USERS = Array.from({ length: 12 }, (_, idx) => {
	const n = String(idx + 1).padStart(2, "0");
	return {
		id: `test-user-${n}@local.test`,
		name: `Test User ${n}`,
	};
});

async function main() {
	const room = await prisma.room.upsert({
		where: { name: LOCAL_ROOM_NAME },
		update: {},
		create: { name: LOCAL_ROOM_NAME },
	});

	for (const user of TEST_USERS) {
		await prisma.user.upsert({
			where: { id: user.id },
			update: {
				name: user.name,
				currentRoom: LOCAL_ROOM_NAME,
			},
			create: {
				id: user.id,
				name: user.name,
				currentRoom: LOCAL_ROOM_NAME,
			},
		});

		await prisma.userRoom.upsert({
			where: {
				userId_roomId: {
					userId: user.id,
					roomId: room.id,
				},
			},
			update: {},
			create: {
				userId: user.id,
				roomId: room.id,
			},
		});
	}

	console.log(
		`Seeded ${TEST_USERS.length} test users into room '${LOCAL_ROOM_NAME}'.`
	);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

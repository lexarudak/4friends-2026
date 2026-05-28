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

const LOCAL_2_ROOM_NAME = "local-2";
const LOCAL_2_USERS = Array.from({ length: 10 }, (_, idx) => {
	const n = String(idx + 1).padStart(2, "0");
	return {
		id: `room2-player-${n}@local.test`,
		name: `Room2 Player ${n}`,
	};
});

const EXTRA_LOCAL_2_MEMBER_IDS = [
	"test-user-10@local.test",
	"test-user-11@local.test",
	"test-user-12@local.test",
];

async function addMembership(userId: string, roomId: string) {
	await prisma.userRoom.upsert({
		where: {
			userId_roomId: {
				userId,
				roomId,
			},
		},
		update: {},
		create: {
			userId,
			roomId,
		},
	});
}

async function main() {
	const room = await prisma.room.upsert({
		where: { name: LOCAL_2_ROOM_NAME },
		update: {},
		create: { name: LOCAL_2_ROOM_NAME },
	});

	for (const user of LOCAL_2_USERS) {
		await prisma.user.upsert({
			where: { id: user.id },
			update: {
				name: user.name,
				currentRoom: LOCAL_2_ROOM_NAME,
			},
			create: {
				id: user.id,
				name: user.name,
				currentRoom: LOCAL_2_ROOM_NAME,
			},
		});

		await addMembership(user.id, room.id);
	}

	for (const userId of EXTRA_LOCAL_2_MEMBER_IDS) {
		const existing = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!existing) {
			console.warn(`Skipped missing user: ${userId}`);
			continue;
		}

		await addMembership(userId, room.id);
	}

	console.log(
		`Seeded ${LOCAL_2_USERS.length} distinct room2 users and linked ${EXTRA_LOCAL_2_MEMBER_IDS.length} existing users to '${LOCAL_2_ROOM_NAME}'.`
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

/**
 * Seeds UCL 2024/25 Final (PSG 5-0 Inter, 31 May 2025) with its real fixture ID.
 * Creates 2 UCL rooms and places bets for test users.
 * Points are calculated immediately since the match is FT.
 *
 * Run: npx tsx scripts/seed-ucl-final.ts
 */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

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
	connectionString: normalizeSSLMode(process.env.DATABASE_URL)!,
});
const prisma = new PrismaClient({ adapter });

const UCL_MATCH_ID = 1374812;
const TOURNAMENT = "ucl2526";
const ROOMS = ["ucl-room-1", "ucl-room-2"];

const MATCH_DATA = {
	id: UCL_MATCH_ID,
	tournament: TOURNAMENT,
	timezone: "UTC",
	date: new Date("2025-05-31T19:00:00Z"),
	timestamp: 1748718000,
	leagueId: 2,
	leagueName: "UEFA Champions League",
	leagueCountry: "World",
	leagueLogo: "https://media.api-sports.io/football/leagues/2.png",
	leagueSeason: 2025,
	round: "Final",
	statusShort: "FT",
	statusLong: "Match Finished",
	statusElapsed: 90,
	statusExtra: null,
	homeTeamId: 85,
	homeTeamName: "Paris Saint Germain",
	homeTeamLogo: "https://media.api-sports.io/football/teams/85.png",
	homeTeamWinner: true,
	awayTeamId: 505,
	awayTeamName: "Inter",
	awayTeamLogo: "https://media.api-sports.io/football/teams/505.png",
	awayTeamWinner: false,
	goalsHome: 5,
	goalsAway: 0,
	halftimeHome: 2,
	halftimeAway: 0,
	fulltimeHome: 5,
	fulltimeAway: 0,
	extratimeHome: null,
	extratimeAway: null,
	penaltyHome: null,
	penaltyAway: null,
};

type BetData = { userId: string; betHome: number; betAway: number };

const ROOM_1_BETS: BetData[] = [
	{ userId: "lexarudak@gmail.com", betHome: 3, betAway: 0 },
	{ userId: "test-user-01@local.test", betHome: 2, betAway: 1 },
	{ userId: "test-user-02@local.test", betHome: 1, betAway: 1 },
	{ userId: "test-user-03@local.test", betHome: 5, betAway: 0 },
	{ userId: "test-user-04@local.test", betHome: 2, betAway: 0 },
];

const ROOM_2_BETS: BetData[] = [
	{ userId: "lexarudak@gmail.com", betHome: 4, betAway: 0 },
	{ userId: "test-user-05@local.test", betHome: 5, betAway: 0 },
	{ userId: "test-user-06@local.test", betHome: 1, betAway: 0 },
	{ userId: "test-user-07@local.test", betHome: 3, betAway: 1 },
];

function calcPoints(
	betHome: number,
	betAway: number,
	actualHome: number,
	actualAway: number
): number {
	if (betHome === actualHome && betAway === actualAway) return 3;
	const pOut = Math.sign(betHome - betAway);
	const aOut = Math.sign(actualHome - actualAway);
	if (pOut !== aOut) return 0;
	if (betHome - betAway === actualHome - actualAway) return 2;
	return 1;
}

async function main() {
	console.log("=== Seeding UCL Final 2024/25 ===");

	// 1. Upsert match
	await prisma.match.upsert({
		where: { id: UCL_MATCH_ID },
		create: MATCH_DATA,
		update: MATCH_DATA,
	});
	console.log(
		`✓ Match ${UCL_MATCH_ID} upserted: ${MATCH_DATA.homeTeamName} ${MATCH_DATA.fulltimeHome}-${MATCH_DATA.fulltimeAway} ${MATCH_DATA.awayTeamName} (FT)`
	);

	// 2. Create rooms
	for (const roomName of ROOMS) {
		await prisma.room.upsert({
			where: { name: roomName },
			create: { name: roomName, tournament: TOURNAMENT },
			update: { tournament: TOURNAMENT },
		});
		console.log(`✓ Room "${roomName}" (tournament=${TOURNAMENT})`);
	}

	// 3. Seed bets with calculated points
	const roomBets: [string, BetData[]][] = [
		[ROOMS[0], ROOM_1_BETS],
		[ROOMS[1], ROOM_2_BETS],
	];

	for (const [roomId, bets] of roomBets) {
		let count = 0;
		for (const bet of bets) {
			const user = await prisma.user.findUnique({
				where: { id: bet.userId },
				select: { id: true },
			});
			if (!user) {
				console.warn(`  ⚠ User ${bet.userId} not found, skipping`);
				continue;
			}

			const points = calcPoints(
				bet.betHome,
				bet.betAway,
				MATCH_DATA.fulltimeHome,
				MATCH_DATA.fulltimeAway
			);

			await prisma.bet.upsert({
				where: {
					userId_matchId_roomId: {
						userId: bet.userId,
						matchId: UCL_MATCH_ID,
						roomId,
					},
				},
				create: {
					userId: bet.userId,
					matchId: UCL_MATCH_ID,
					roomId,
					betHome: bet.betHome,
					betAway: bet.betAway,
					points,
					bonusPoints: 0,
				},
				update: {
					betHome: bet.betHome,
					betAway: bet.betAway,
					points,
					bonusPoints: 0,
				},
			});
			count++;
		}
		console.log(`✓ Room "${roomId}": ${count} bets seeded with points`);
	}

	// 4. Show points summary
	console.log("\n=== Points summary ===");
	for (const [roomId] of roomBets) {
		const bets = await prisma.bet.findMany({
			where: { roomId, matchId: UCL_MATCH_ID },
			include: { user: { select: { name: true } } },
			orderBy: { points: "desc" },
		});
		console.log(`\nRoom "${roomId}":`);
		for (const b of bets) {
			const name = b.user.name ?? b.userId;
			console.log(
				`  ${name}: ${b.betHome}:${b.betAway} → ${b.points ?? "?"} pts`
			);
		}
	}

	console.log("\nDone. Switch to ucl-room-1 or ucl-room-2 to test Global Top.");
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

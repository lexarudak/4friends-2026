/**
 * Seeds the UCL 2024/25 Semi-final PSG 2-1 Arsenal (fixture 1371731),
 * tagged as tournament "ucl2526", plus bets for the existing UCL rooms.
 * Run: npx tsx scripts/seed-ucl-psg-arsenal.ts
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
		if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
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

const MATCH_ID = 1371731;
const TOURNAMENT = "ucl2526";
const ROOMS = ["ucl-room-1", "ucl-room-2", "arsenal"];

const MATCH_DATA = {
	id: MATCH_ID,
	tournament: TOURNAMENT,
	timezone: "UTC",
	date: new Date("2025-05-07T19:00:00Z"),
	timestamp: 1746644400,
	leagueId: 2,
	leagueName: "UEFA Champions League",
	leagueCountry: "World",
	leagueLogo: "https://media.api-sports.io/football/leagues/2.png",
	leagueSeason: 2024,
	round: "Semi-finals",
	statusShort: "FT",
	statusLong: "Match Finished",
	statusElapsed: 90,
	homeTeamId: 85,
	homeTeamName: "Paris Saint Germain",
	homeTeamLogo: "https://media.api-sports.io/football/teams/85.png",
	homeTeamWinner: true,
	awayTeamId: 42,
	awayTeamName: "Arsenal",
	awayTeamLogo: "https://media.api-sports.io/football/teams/42.png",
	awayTeamWinner: false,
	goalsHome: 2,
	goalsAway: 1,
	halftimeHome: 1,
	halftimeAway: 0,
	fulltimeHome: 2,
	fulltimeAway: 1,
};

type BetData = { userId: string; betHome: number; betAway: number; winPick?: number };

// winPick is a team id (playoff). PSG=85, Arsenal=42.
const ROOM_BETS: Record<string, BetData[]> = {
	"ucl-room-1": [
		{ userId: "lexarudak@gmail.com", betHome: 2, betAway: 1, winPick: 85 },
		{ userId: "test-user-01@local.test", betHome: 1, betAway: 1, winPick: 85 },
		{ userId: "test-user-02@local.test", betHome: 0, betAway: 2, winPick: 42 },
		{ userId: "test-user-03@local.test", betHome: 3, betAway: 1, winPick: 85 },
	],
	"ucl-room-2": [
		{ userId: "lexarudak@gmail.com", betHome: 2, betAway: 0, winPick: 85 },
		{ userId: "test-user-05@local.test", betHome: 2, betAway: 1, winPick: 85 },
		{ userId: "test-user-06@local.test", betHome: 1, betAway: 2, winPick: 42 },
	],
	arsenal: [
		{ userId: "lexarudak@gmail.com", betHome: 1, betAway: 2, winPick: 42 },
	],
};

function basePoints(bh: number, ba: number, ah: number, aa: number): number {
	if (bh === ah && ba === aa) return 3;
	if (Math.sign(bh - ba) !== Math.sign(ah - aa)) return 0;
	if (bh - ba === ah - aa) return 2;
	return 1;
}

async function main() {
	await prisma.match.upsert({
		where: { id: MATCH_ID },
		create: MATCH_DATA,
		update: MATCH_DATA,
	});
	console.log(
		`✓ Match ${MATCH_ID}: PSG ${MATCH_DATA.fulltimeHome}-${MATCH_DATA.fulltimeAway} Arsenal (${TOURNAMENT}, ${MATCH_DATA.round})`
	);

	const actualWinner = 85; // PSG

	for (const roomName of ROOMS) {
		await prisma.room.upsert({
			where: { name: roomName },
			create: { name: roomName, tournament: TOURNAMENT },
			update: { tournament: TOURNAMENT },
		});

		const bets = ROOM_BETS[roomName] ?? [];
		let count = 0;
		for (const bet of bets) {
			const user = await prisma.user.findUnique({
				where: { id: bet.userId },
				select: { id: true },
			});
			if (!user) continue;

			const points = basePoints(
				bet.betHome,
				bet.betAway,
				MATCH_DATA.fulltimeHome,
				MATCH_DATA.fulltimeAway
			);
			const bonusPoints = bet.winPick === actualWinner ? 2 : 0;

			await prisma.bet.upsert({
				where: {
					userId_matchId_roomId: {
						userId: bet.userId,
						matchId: MATCH_ID,
						roomId: roomName,
					},
				},
				create: {
					userId: bet.userId,
					matchId: MATCH_ID,
					roomId: roomName,
					betHome: bet.betHome,
					betAway: bet.betAway,
					winPick: bet.winPick ?? null,
					points,
					bonusPoints,
				},
				update: {
					betHome: bet.betHome,
					betAway: bet.betAway,
					winPick: bet.winPick ?? null,
					points,
					bonusPoints,
				},
			});
			count++;
		}
		console.log(`✓ Room "${roomName}": ${count} bets`);
	}

	console.log("\nDone.");
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

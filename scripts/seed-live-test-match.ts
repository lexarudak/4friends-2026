/**
 * Full live-test automation: seeds a match, waits for kickoff, then walks it
 * through the entire lifecycle automatically.
 *
 * Run: npx tsx scripts/seed-live-test-match.ts [minutesFromNow]
 *
 * Timeline (default: 3 min until kickoff):
 *   T-3min : match seeded (NS) → open http://localhost:3000 now
 *   T+0    : kickoff → 1H, elapsed=1
 *   T+1min : 1H, elapsed=15, score 0-0
 *   T+2min : 1H, elapsed=30, score 1-0
 *   T+3min : HT, elapsed=45, score 1-1
 *   T+4min : 2H, elapsed=60, score 1-1
 *   T+5min : 2H, elapsed=75, score 2-1
 *   T+6min : FT, fulltime 2-1 → points recalculated
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

const MATCH_ID = 999_999;

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

function log(msg: string) {
	const now = new Date().toISOString().slice(11, 19);
	console.log(`[${now}] ${msg}`);
}

async function basePoints(
	betHome: number,
	betAway: number,
	actualHome: number,
	actualAway: number
): Promise<number> {
	if (betHome === actualHome && betAway === actualAway) return 3;
	const predictedOutcome = Math.sign(betHome - betAway);
	const actualOutcome = Math.sign(actualHome - actualAway);
	if (predictedOutcome !== actualOutcome) return 0;
	if (betHome - betAway === actualHome - actualAway) return 2;
	return 1;
}

async function recalculate(matchId: number) {
	const match = await prisma.match.findUnique({
		where: { id: matchId },
		select: {
			round: true,
			homeTeamId: true,
			awayTeamId: true,
			homeTeamWinner: true,
			awayTeamWinner: true,
			fulltimeHome: true,
			fulltimeAway: true,
			goalsHome: true,
			goalsAway: true,
		},
	});
	if (!match) return 0;

	const actualHome = match.fulltimeHome ?? match.goalsHome;
	const actualAway = match.fulltimeAway ?? match.goalsAway;
	if (actualHome == null || actualAway == null) return 0;

	const bets = await prisma.bet.findMany({
		where: { matchId },
		select: { id: true, betHome: true, betAway: true, winPick: true },
	});

	let updated = 0;
	for (const bet of bets) {
		const points = await basePoints(bet.betHome, bet.betAway, actualHome, actualAway);
		await prisma.bet.update({
			where: { id: bet.id },
			data: { points, bonusPoints: 0 },
		});
		updated++;
	}
	return updated;
}

async function update(data: Parameters<typeof prisma.match.update>[0]["data"]) {
	await prisma.match.update({ where: { id: MATCH_ID }, data });
}

type Phase = {
	label: string;
	delay: number;
	apply: () => Promise<void>;
};

const ROOM_ID = "local";

const BETS: { userId: string; betHome: number; betAway: number }[] = [
	{ userId: "lexarudak@gmail.com", betHome: 2, betAway: 1 },
	{ userId: "test-user-01@local.test", betHome: 1, betAway: 0 },
	{ userId: "test-user-02@local.test", betHome: 2, betAway: 2 },
	{ userId: "test-user-03@local.test", betHome: 1, betAway: 1 },
	{ userId: "test-user-04@local.test", betHome: 0, betAway: 1 },
	{ userId: "test-user-05@local.test", betHome: 3, betAway: 1 },
	{ userId: "test-user-06@local.test", betHome: 2, betAway: 1 },
	{ userId: "test-user-07@local.test", betHome: 0, betAway: 0 },
];

async function seedBets() {
	let seeded = 0;
	for (const bet of BETS) {
		const userExists = await prisma.user.findUnique({
			where: { id: bet.userId },
			select: { id: true },
		});
		if (!userExists) continue;

		await prisma.bet.upsert({
			where: {
				userId_matchId_roomId: {
					userId: bet.userId,
					matchId: MATCH_ID,
					roomId: ROOM_ID,
				},
			},
			create: {
				userId: bet.userId,
				matchId: MATCH_ID,
				roomId: ROOM_ID,
				betHome: bet.betHome,
				betAway: bet.betAway,
			},
			update: {
				betHome: bet.betHome,
				betAway: bet.betAway,
				points: null,
				bonusPoints: null,
			},
		});
		seeded++;
	}
	return seeded;
}

async function main() {
	const minutesFromNow = Number(process.argv[2] ?? "3");
	if (Number.isNaN(minutesFromNow) || minutesFromNow < 1) {
		console.error("Usage: npx tsx scripts/seed-live-test-match.ts [minutesFromNow>=1]");
		process.exit(1);
	}

	const startDate = new Date(Date.now() + minutesFromNow * 60_000);
	const timestamp = Math.floor(startDate.getTime() / 1000);

	await prisma.match.upsert({
		where: { id: MATCH_ID },
		create: {
			id: MATCH_ID,
			timezone: "UTC",
			date: startDate,
			timestamp,
			leagueId: 1,
			leagueName: "FIFA World Cup",
			leagueCountry: "World",
			leagueLogo: "https://media.api-sports.io/football/leagues/1.png",
			leagueSeason: 2026,
			round: "Group Stage - Group LIVE",
			statusShort: "NS",
			statusLong: "Not Started",
			homeTeamId: 9001,
			homeTeamName: "Live Test Home",
			homeTeamLogo: "https://flagcdn.com/w40/un.png",
			awayTeamId: 9002,
			awayTeamName: "Live Test Away",
			awayTeamLogo: "https://flagcdn.com/w40/un.png",
		},
		update: {
			date: startDate,
			timestamp,
			statusShort: "NS",
			statusLong: "Not Started",
			statusElapsed: null,
			statusExtra: null,
			goalsHome: null,
			goalsAway: null,
			halftimeHome: null,
			halftimeAway: null,
			fulltimeHome: null,
			fulltimeAway: null,
			extratimeHome: null,
			extratimeAway: null,
			penaltyHome: null,
			penaltyAway: null,
			homeTeamWinner: null,
			awayTeamWinner: null,
		},
	});

	const betsSeeded = await seedBets();

	log(`Match ${MATCH_ID} seeded — kicks off at ${startDate.toISOString()}`);
	log(`Bets seeded for ${betsSeeded} players in room "${ROOM_ID}".`);
	log(`→ Open http://localhost:3000 now. Timer should show ~${minutesFromNow} min.`);
	log(`Waiting ${minutesFromNow} minute(s) for kickoff...`);

	const phases: Phase[] = [
		{
			label: "Kickoff → 1H elapsed=1, score 0-0",
			delay: minutesFromNow * 60_000,
			async apply() {
				await update({
					statusShort: "1H",
					statusLong: "First Half",
					statusElapsed: 1,
					goalsHome: 0,
					goalsAway: 0,
				});
			},
		},
		{
			label: "1H elapsed=15, score 0-0",
			delay: 60_000,
			async apply() {
				await update({
					statusShort: "1H",
					statusLong: "First Half",
					statusElapsed: 15,
				});
			},
		},
		{
			label: "1H elapsed=30, score 1-0 (home scores)",
			delay: 60_000,
			async apply() {
				await update({
					statusShort: "1H",
					statusLong: "First Half",
					statusElapsed: 30,
					goalsHome: 1,
				});
			},
		},
		{
			label: "HT elapsed=45, score 1-1 (away equalises)",
			delay: 60_000,
			async apply() {
				await update({
					statusShort: "HT",
					statusLong: "Halftime",
					statusElapsed: 45,
					goalsHome: 1,
					goalsAway: 1,
					halftimeHome: 1,
					halftimeAway: 1,
				});
			},
		},
		{
			label: "2H elapsed=60, score 1-1",
			delay: 60_000,
			async apply() {
				await update({
					statusShort: "2H",
					statusLong: "Second Half",
					statusElapsed: 60,
				});
			},
		},
		{
			label: "2H elapsed=75, score 2-1 (home leads again)",
			delay: 60_000,
			async apply() {
				await update({
					statusShort: "2H",
					statusLong: "Second Half",
					statusElapsed: 75,
					goalsHome: 2,
				});
			},
		},
		{
			label: "FT — match finished, fulltime 2-1, home wins",
			delay: 60_000,
			async apply() {
				await update({
					statusShort: "FT",
					statusLong: "Match Finished",
					statusElapsed: 90,
					goalsHome: 2,
					goalsAway: 1,
					fulltimeHome: 2,
					fulltimeAway: 1,
					homeTeamWinner: true,
					awayTeamWinner: false,
				});
				const count = await recalculate(MATCH_ID);
				log(`  → recalculated ${count} bets`);
			},
		},
	];

	let first = true;
	for (const phase of phases) {
		if (first) {
			first = false;
		}
		await sleep(phase.delay);
		await phase.apply();
		log(`✓ ${phase.label}`);
	}

	log("Done — full match lifecycle complete.");
	log(`To clean up: npm run simulate:match -- ${MATCH_ID} --step ns`);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

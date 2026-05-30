/**
 * Match simulator — steps a single match through its lifecycle.
 *
 * Run: npx tsx scripts/simulate-match.ts <matchId> [--step <step>]
 *
 * Steps:
 *   ns       → NS, scores null
 *   start    → 1H, elapsed=5
 *   first    → 1H, elapsed=30
 *   ht       → HT, elapsed=45, goalsHome/Away set
 *   second   → 2H, elapsed=70
 *   finish   → FT, fulltime scores set, winner computed
 *   playoff-aet → AET (extra-time draw → penalty win)
 *
 * Without --step, runs the whole sequence with 8-second pauses.
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

const FINAL_STATUSES = new Set(["FT", "AET", "PEN"]);

function basePoints(
	betHome: number,
	betAway: number,
	actualHome: number,
	actualAway: number
): number {
	if (betHome === actualHome && betAway === actualAway) return 3;
	const predictedOutcome = Math.sign(betHome - betAway);
	const actualOutcome = Math.sign(actualHome - actualAway);
	if (predictedOutcome !== actualOutcome) return 0;
	if (betHome - betAway === actualHome - actualAway) return 2;
	return 1;
}

function isPlayoffRound(round: string): boolean {
	return !/group/i.test(round);
}

async function recalculatePoints(matchId: number) {
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
			statusShort: true,
		},
	});
	if (!match || !FINAL_STATUSES.has(match.statusShort)) return 0;

	const actualHome = match.fulltimeHome ?? match.goalsHome;
	const actualAway = match.fulltimeAway ?? match.goalsAway;
	if (actualHome == null || actualAway == null) return 0;

	const bets = await prisma.bet.findMany({
		where: { matchId },
		select: { id: true, betHome: true, betAway: true, winPick: true },
	});

	const isPlayoff = isPlayoffRound(match.round);
	const winnerTeamId =
		match.homeTeamWinner === true
			? match.homeTeamId
			: match.awayTeamWinner === true
				? match.awayTeamId
				: null;

	let updated = 0;
	for (const bet of bets) {
		const points = basePoints(bet.betHome, bet.betAway, actualHome, actualAway);
		const bonusPoints =
			isPlayoff &&
			bet.winPick != null &&
			winnerTeamId != null &&
			bet.winPick === winnerTeamId
				? 2
				: 0;
		await prisma.bet.update({
			where: { id: bet.id },
			data: { points, bonusPoints },
		});
		updated++;
	}
	return updated;
}

type Step = {
	name: string;
	apply: (match: { round: string; id: number }) => Promise<void>;
};

const steps: Record<string, Step> = {
	ns: {
		name: "NS — reset to not started",
		async apply({ id }) {
			await prisma.match.update({
				where: { id },
				data: {
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
		},
	},
	start: {
		name: "1H — kickoff (elapsed=5)",
		async apply({ id }) {
			await prisma.match.update({
				where: { id },
				data: {
					statusShort: "1H",
					statusLong: "First Half",
					statusElapsed: 5,
					goalsHome: 0,
					goalsAway: 0,
				},
			});
		},
	},
	first: {
		name: "1H — mid first half (elapsed=30, score 1-0)",
		async apply({ id }) {
			await prisma.match.update({
				where: { id },
				data: {
					statusShort: "1H",
					statusLong: "First Half",
					statusElapsed: 30,
					goalsHome: 1,
					goalsAway: 0,
				},
			});
		},
	},
	ht: {
		name: "HT — halftime (1-1)",
		async apply({ id }) {
			await prisma.match.update({
				where: { id },
				data: {
					statusShort: "HT",
					statusLong: "Halftime",
					statusElapsed: 45,
					goalsHome: 1,
					goalsAway: 1,
					halftimeHome: 1,
					halftimeAway: 1,
				},
			});
		},
	},
	second: {
		name: "2H — second half (elapsed=70, 2-1)",
		async apply({ id }) {
			await prisma.match.update({
				where: { id },
				data: {
					statusShort: "2H",
					statusLong: "Second Half",
					statusElapsed: 70,
					goalsHome: 2,
					goalsAway: 1,
				},
			});
		},
	},
	finish: {
		name: "FT — full time (home wins 2-1)",
		async apply({ id }) {
			await prisma.match.update({
				where: { id },
				data: {
					statusShort: "FT",
					statusLong: "Match Finished",
					statusElapsed: 90,
					goalsHome: 2,
					goalsAway: 1,
					fulltimeHome: 2,
					fulltimeAway: 1,
					homeTeamWinner: true,
					awayTeamWinner: false,
				},
			});
			const count = await recalculatePoints(id);
			console.log(`  → recalculated ${count} bets`);
		},
	},
	"playoff-aet": {
		name: "AET — extra-time win (home 3-2 after ET)",
		async apply({ id }) {
			await prisma.match.update({
				where: { id },
				data: {
					statusShort: "AET",
					statusLong: "Match Finished After Extra Time",
					statusElapsed: 120,
					goalsHome: 3,
					goalsAway: 2,
					fulltimeHome: 2,
					fulltimeAway: 2,
					extratimeHome: 1,
					extratimeAway: 0,
					homeTeamWinner: true,
					awayTeamWinner: false,
				},
			});
			const count = await recalculatePoints(id);
			console.log(`  → recalculated ${count} bets`);
		},
	},
};

async function main() {
	const matchIdArg = process.argv[2];
	if (!matchIdArg) {
		console.error("Usage: tsx scripts/simulate-match.ts <matchId> [--step <step>]");
		console.error("Steps:", Object.keys(steps).join(", "));
		process.exit(1);
	}
	const matchId = Number(matchIdArg);
	const stepFlag = process.argv.indexOf("--step");
	const stepName = stepFlag > 0 ? process.argv[stepFlag + 1] : null;

	const match = await prisma.match.findUnique({
		where: { id: matchId },
		select: {
			id: true,
			round: true,
			homeTeamName: true,
			awayTeamName: true,
		},
	});
	if (!match) {
		console.error(`Match ${matchId} not found`);
		process.exit(1);
	}

	console.log(
		`Simulating match ${match.id}: ${match.homeTeamName} vs ${match.awayTeamName} (${match.round})`
	);

	if (stepName) {
		const step = steps[stepName];
		if (!step) {
			console.error(`Unknown step "${stepName}". Available: ${Object.keys(steps).join(", ")}`);
			process.exit(1);
		}
		console.log(`→ ${step.name}`);
		await step.apply(match);
		console.log("Done.");
		return;
	}

	const sequence: string[] = match.round.toLowerCase().includes("group")
		? ["ns", "start", "first", "ht", "second", "finish"]
		: ["ns", "start", "first", "ht", "second", "playoff-aet"];

	for (const key of sequence) {
		const step = steps[key];
		console.log(`→ ${step.name}`);
		await step.apply(match);
		if (key !== sequence[sequence.length - 1]) {
			await new Promise((r) => setTimeout(r, 8000));
		}
	}
	console.log("Sequence complete.");
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

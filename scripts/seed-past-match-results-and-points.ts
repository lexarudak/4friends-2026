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

function hashString(input: string): number {
	let h = 0;
	for (let i = 0; i < input.length; i++) {
		h = (h * 31 + input.charCodeAt(i)) >>> 0;
	}
	return h;
}

function isPlayoffRound(round: string): boolean {
	return !/group/i.test(round);
}

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

	const predictedDiff = betHome - betAway;
	const actualDiff = actualHome - actualAway;
	if (predictedDiff === actualDiff) return 2;

	return 1;
}

type MatchSeedResult = {
	home: number;
	away: number;
	homeWinner: boolean | null;
	awayWinner: boolean | null;
};

function generateResult(
	matchId: number,
	round: string,
	homeTeamId: number,
	awayTeamId: number
): MatchSeedResult {
	const seed = hashString(`${matchId}:${round}:${homeTeamId}:${awayTeamId}`);
	const isPlayoff = isPlayoffRound(round);

	const outcome = seed % 5;
	const base = (seed >>> 3) % 4;
	const margin = ((seed >>> 5) % 3) + 1;

	if (outcome === 0 || (isPlayoff && outcome === 1)) {
		const drawGoals = base;
		if (!isPlayoff) {
			return {
				home: drawGoals,
				away: drawGoals,
				homeWinner: null,
				awayWinner: null,
			};
		}

		const homeAdvances = ((seed >>> 7) & 1) === 0;
		return {
			home: drawGoals,
			away: drawGoals,
			homeWinner: homeAdvances,
			awayWinner: !homeAdvances,
		};
	}

	if (outcome === 2 || outcome === 3) {
		const home = base + margin;
		const away = base;
		return {
			home,
			away,
			homeWinner: true,
			awayWinner: false,
		};
	}

	const home = base;
	const away = base + margin;
	return {
		home,
		away,
		homeWinner: false,
		awayWinner: true,
	};
}

async function main() {
	const now = new Date();
	const pastMatches = await prisma.match.findMany({
		where: { date: { lte: now } },
		orderBy: { date: "asc" },
		select: {
			id: true,
			round: true,
			homeTeamId: true,
			awayTeamId: true,
		},
	});

	if (pastMatches.length === 0) {
		console.warn("No past matches found. Nothing to update.");
		return;
	}

	for (const match of pastMatches) {
		const result = generateResult(
			match.id,
			match.round,
			match.homeTeamId,
			match.awayTeamId
		);

		await prisma.match.update({
			where: { id: match.id },
			data: {
				statusLong: "Match Finished",
				statusShort: "FT",
				statusElapsed: 90,
				goalsHome: result.home,
				goalsAway: result.away,
				fulltimeHome: result.home,
				fulltimeAway: result.away,
				homeTeamWinner: result.homeWinner,
				awayTeamWinner: result.awayWinner,
			},
		});
	}

	const pastMatchIds = pastMatches.map((m) => m.id);
	const bets = await prisma.bet.findMany({
		where: { matchId: { in: pastMatchIds } },
		select: {
			id: true,
			betHome: true,
			betAway: true,
			winPick: true,
			match: {
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
			},
		},
	});

	let scoredBets = 0;
	for (const bet of bets) {
		const actualHome = bet.match.fulltimeHome ?? bet.match.goalsHome;
		const actualAway = bet.match.fulltimeAway ?? bet.match.goalsAway;
		if (actualHome == null || actualAway == null) continue;

		const points = basePoints(bet.betHome, bet.betAway, actualHome, actualAway);
		let bonusPoints = 0;

		if (isPlayoffRound(bet.match.round) && bet.winPick != null) {
			const actualWinnerTeamId =
				bet.match.homeTeamWinner === true
					? bet.match.homeTeamId
					: bet.match.awayTeamWinner === true
						? bet.match.awayTeamId
						: null;

			if (actualWinnerTeamId != null && actualWinnerTeamId === bet.winPick) {
				bonusPoints = 2;
			}
		}

		await prisma.bet.update({
			where: { id: bet.id },
			data: { points, bonusPoints },
		});
		scoredBets++;
	}

	console.log(
		JSON.stringify(
			{
				pastMatchesUpdated: pastMatches.length,
				betsFound: bets.length,
				scoredBets,
			},
			null,
			2
		)
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

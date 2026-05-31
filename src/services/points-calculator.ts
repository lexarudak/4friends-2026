import { prisma } from "@/lib/prisma";
import { isKnockoutRound } from "@/utils/knockout";

const FINAL_STATUSES = new Set(["FT", "AET", "PEN"]);

export function isFinalStatus(statusShort: string): boolean {
	return FINAL_STATUSES.has(statusShort);
}

function isPlayoffRound(round: string): boolean {
	return isKnockoutRound(round);
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

export const PointsCalculator = {
	async recalculate(matchId: number): Promise<number> {
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

		if (!match || !isFinalStatus(match.statusShort)) return 0;

		const actualHome = match.fulltimeHome ?? match.goalsHome;
		const actualAway = match.fulltimeAway ?? match.goalsAway;
		if (actualHome == null || actualAway == null) return 0;

		const bets = await prisma.bet.findMany({
			where: { matchId },
			select: { id: true, betHome: true, betAway: true, winPick: true },
		});

		const isPlayoff = isPlayoffRound(match.round);
		const actualWinnerTeamId =
			match.homeTeamWinner === true
				? match.homeTeamId
				: match.awayTeamWinner === true
					? match.awayTeamId
					: null;

		const updates = bets.map((bet) => {
			const points = basePoints(bet.betHome, bet.betAway, actualHome, actualAway);
			const bonusPoints =
				isPlayoff &&
				bet.winPick != null &&
				actualWinnerTeamId != null &&
				bet.winPick === actualWinnerTeamId
					? 2
					: 0;

			return prisma.bet.update({
				where: { id: bet.id },
				data: { points, bonusPoints },
			});
		});

		if (updates.length === 0) return 0;
		await prisma.$transaction(updates);
		return updates.length;
	},
};

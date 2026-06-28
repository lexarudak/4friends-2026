import { prisma } from "@/lib/prisma";
import type { Bet } from "@/types/api";

export class BetsLockedError extends Error {
	constructor(public readonly matchIds: number[]) {
		super("Bets are locked for started matches.");
		this.name = "BetsLockedError";
	}
}

export const BetsService = {
	async getBets(userId: string, roomId: string): Promise<Bet[]> {
		try {
			const rows = await prisma.bet.findMany({
				where: { userId, roomId },
				select: {
					matchId: true,
					betHome: true,
					betAway: true,
					winPick: true,
					match: {
						select: {
							homeTeamId: true,
							awayTeamId: true,
						},
					},
				},
			});
			return rows.map((r) => ({
				matchId: String(r.matchId),
				home: r.betHome,
				away: r.betAway,
				winPick:
					r.winPick == null
						? null
						: r.winPick === r.match.homeTeamId
							? "home"
							: r.winPick === r.match.awayTeamId
								? "away"
								: null,
			}));
		} catch (err) {
			console.error("[BetsService.getBets]", err);
			return [];
		}
	},

	async saveBets(userId: string, roomId: string, bets: Bet[]): Promise<void> {
		const validBets = bets.filter(
			(b) =>
				b.home !== null && b.away !== null && Number.isFinite(Number(b.matchId))
		);

		const matchIds = [...new Set(validBets.map((b) => Number(b.matchId)))];
		if (matchIds.length === 0) return;

		const matchRows = await prisma.match.findMany({
			where: { id: { in: matchIds } },
			select: {
				id: true,
				date: true,
				statusShort: true,
				homeTeamId: true,
				awayTeamId: true,
			},
		});

		const now = new Date();
		const lockedMatchIds = matchRows
			.filter((match) => match.date <= now || match.statusShort !== "NS")
			.map((match) => match.id);

		if (lockedMatchIds.length > 0) {
			throw new BetsLockedError(lockedMatchIds);
		}

		const matchById = new Map(matchRows.map((m) => [m.id, m]));

		const ops = validBets.flatMap((b) => {
			const matchId = Number(b.matchId);
			const match = matchById.get(matchId);
			if (!match) return [];

			const winPick =
				b.winPick === "home"
					? (match?.homeTeamId ?? null)
					: b.winPick === "away"
						? (match?.awayTeamId ?? null)
						: null;

			return [
				prisma.bet.upsert({
					where: {
						userId_matchId_roomId: {
							userId,
							matchId,
							roomId,
						},
					},
					update: {
						betHome: b.home!,
						betAway: b.away!,
						winPick,
					},
					create: {
						userId,
						matchId,
						roomId,
						betHome: b.home!,
						betAway: b.away!,
						winPick,
					},
				}),
			];
		});

		if (ops.length === 0) return;
		await prisma.$transaction(ops);
	},
};

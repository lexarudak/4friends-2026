import { prisma } from "@/lib/prisma";
import type { Bet } from "@/types/api";

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
		const matchRows = await prisma.match.findMany({
			where: { id: { in: matchIds } },
			select: { id: true, homeTeamId: true, awayTeamId: true },
		});
		const matchById = new Map(matchRows.map((m) => [m.id, m]));

		const ops = validBets.map((b) => {
			const matchId = Number(b.matchId);
			const match = matchById.get(matchId);
			const winPick =
				b.winPick === "home"
					? (match?.homeTeamId ?? null)
					: b.winPick === "away"
						? (match?.awayTeamId ?? null)
						: null;

			return prisma.bet.upsert({
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
			});
		});
		await prisma.$transaction(ops);
	},

	async clearBets(userId: string, roomId: string): Promise<void> {
		await prisma.bet.deleteMany({ where: { userId, roomId } });
	},
};

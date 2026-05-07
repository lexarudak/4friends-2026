import { prisma } from "@/lib/prisma";
import type { Bet } from "@/types/api";

export const BetsService = {
	async getBets(userId: string, roomId: string): Promise<Bet[]> {
		try {
			const rows = await prisma.bet.findMany({
				where: { userId, roomId },
				select: { matchId: true, betHome: true, betAway: true },
			});
			return rows.map((r) => ({
				matchId: String(r.matchId),
				home: r.betHome,
				away: r.betAway,
			}));
		} catch (err) {
			console.error("[BetsService.getBets]", err);
			return [];
		}
	},

	async saveBets(userId: string, roomId: string, bets: Bet[]): Promise<void> {
		const ops = bets
			.filter((b) => b.home !== null && b.away !== null)
			.map((b) =>
				prisma.bet.upsert({
					where: {
						userId_matchId_roomId: {
							userId,
							matchId: Number(b.matchId),
							roomId,
						},
					},
					update: { betHome: b.home!, betAway: b.away! },
					create: {
						userId,
						matchId: Number(b.matchId),
						roomId,
						betHome: b.home!,
						betAway: b.away!,
					},
				})
			);
		await prisma.$transaction(ops);
	},

	async clearBets(userId: string, roomId: string): Promise<void> {
		await prisma.bet.deleteMany({ where: { userId, roomId } });
	},
};

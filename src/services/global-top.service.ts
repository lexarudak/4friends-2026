import { prisma } from "@/lib/prisma";
import type { StatSection, TableRow } from "@/types/api";
import { getCompetitionPosition } from "@/utils/ranking";

function toRows(
	bestByUser: Map<string, number>,
	nameMap: Map<string, string>,
	currentUserId?: string
): TableRow[] {
	const sorted = [...bestByUser.entries()]
		.map(([userId, value]) => ({ userId, value }))
		.sort((a, b) => b.value - a.value);
	const sortedValues = sorted.map((entry) => entry.value);

	return sorted.map((entry, index) => ({
		position: getCompetitionPosition(sortedValues, index),
		name: nameMap.get(entry.userId) ?? entry.userId,
		score: entry.value,
		isCurrentUser: entry.userId === currentUserId,
	}));
}

function keepBestByUser(
	rows: { userId: string; roomId: string; value: number }[]
): Map<string, number> {
	const result = new Map<string, number>();

	for (const row of rows) {
		const existing = result.get(row.userId);
		if (existing === undefined || row.value > existing) {
			result.set(row.userId, row.value);
		}
	}

	return result;
}

function withZeroDefaults(
	userIds: string[],
	bestByUser: Map<string, number>
): Map<string, number> {
	const result = new Map<string, number>();

	for (const userId of userIds) {
		result.set(userId, bestByUser.get(userId) ?? 0);
	}

	return result;
}

export const GlobalTopService = {
	async getSections(currentUserId?: string): Promise<StatSection[]> {
		try {
			const users = await prisma.user.findMany({
				select: { id: true, name: true },
			});

			if (users.length === 0) return [];

			const allUserIds = users.map((user) => user.id);

			const [totalRaw, exactRaw, predictedRaw, finishedMatchesRaw] =
				await Promise.all([
					prisma.bet.groupBy({
						by: ["userId", "roomId"],
						where: { points: { not: null } },
						_sum: { points: true, bonusPoints: true },
					}),
					prisma.bet.groupBy({
						by: ["userId", "roomId"],
						where: { points: 3 },
						_count: { _all: true },
					}),
					prisma.bet.groupBy({
						by: ["userId", "roomId"],
						where: { points: { gte: 1 } },
						_count: { _all: true },
					}),
					prisma.bet.findMany({
						where: { points: { not: null } },
						select: { matchId: true, roomId: true },
						distinct: ["matchId", "roomId"],
					}),
				]);

			const totalBest = keepBestByUser(
				totalRaw.map((row) => ({
					userId: row.userId,
					roomId: row.roomId,
					value: (row._sum.points ?? 0) + (row._sum.bonusPoints ?? 0),
				}))
			);

			const exactBest = keepBestByUser(
				exactRaw.map((row) => ({
					userId: row.userId,
					roomId: row.roomId,
					value: row._count._all,
				}))
			);

			const predictedBest = keepBestByUser(
				predictedRaw.map((row) => ({
					userId: row.userId,
					roomId: row.roomId,
					value: row._count._all,
				}))
			);

			const finishedMatchCountByRoom = new Map<string, number>();
			for (const row of finishedMatchesRaw) {
				finishedMatchCountByRoom.set(
					row.roomId,
					(finishedMatchCountByRoom.get(row.roomId) ?? 0) + 1
				);
			}

			const avgBest = keepBestByUser(
				totalRaw.map((row) => {
					const finishedCount = finishedMatchCountByRoom.get(row.roomId) ?? 0;
					return {
						userId: row.userId,
						roomId: row.roomId,
						value:
							finishedCount > 0
								? Math.round(
										(((row._sum.points ?? 0) + (row._sum.bonusPoints ?? 0)) /
											finishedCount) *
											100
									) / 100
								: 0,
					};
				})
			);

			const nameMap = new Map(
				users.map((user) => [user.id, user.name ?? user.id.split("@")[0]])
			);

			return [
				{
					title: "Total Score",
					rows: toRows(
						withZeroDefaults(allUserIds, totalBest),
						nameMap,
						currentUserId
					),
				},
				{
					title: "Exact Score Hits",
					rows: toRows(
						withZeroDefaults(allUserIds, exactBest),
						nameMap,
						currentUserId
					),
				},
				{
					title: "Predicted Wins",
					rows: toRows(
						withZeroDefaults(allUserIds, predictedBest),
						nameMap,
						currentUserId
					),
				},
				{
					title: "Average Points per Match",
					rows: toRows(
						withZeroDefaults(allUserIds, avgBest),
						nameMap,
						currentUserId
					),
				},
			];
		} catch (err) {
			console.error("[GlobalTopService.getSections]", err);
			return [];
		}
	},
};

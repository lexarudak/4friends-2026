import { prisma } from "@/lib/prisma";
import type { StatSection, TableRow } from "@/types/api";
import { getCompetitionPosition } from "@/utils/ranking";

type BestEntry = { value: number; roomId: string };

function toRows(
	bestByUser: Map<string, BestEntry>,
	nameMap: Map<string, string>,
	currentUserId?: string
): TableRow[] {
	const sorted = [...bestByUser.entries()]
		.map(([userId, entry]) => ({ userId, ...entry }))
		.sort((a, b) => b.value - a.value);
	const sortedValues = sorted.map((entry) => entry.value);

	return sorted.map((entry, index) => ({
		position: getCompetitionPosition(sortedValues, index),
		name: nameMap.get(entry.userId) ?? entry.userId,
		sub: entry.roomId || undefined,
		score: entry.value,
		isCurrentUser: entry.userId === currentUserId,
	}));
}

function keepBestByUser(
	rows: { userId: string; roomId: string; value: number }[]
): Map<string, BestEntry> {
	const result = new Map<string, BestEntry>();

	for (const row of rows) {
		const existing = result.get(row.userId);
		if (existing === undefined || row.value > existing.value) {
			result.set(row.userId, { value: row.value, roomId: row.roomId });
		}
	}

	return result;
}

function withZeroDefaults(
	userIds: string[],
	bestByUser: Map<string, BestEntry>
): Map<string, BestEntry> {
	const result = new Map<string, BestEntry>();

	for (const userId of userIds) {
		result.set(userId, bestByUser.get(userId) ?? { value: 0, roomId: "" });
	}

	return result;
}

export const GlobalTopService = {
	async getSections(
		tournament: string,
		currentUserId?: string
	): Promise<StatSection[]> {
		try {
			const tournamentRooms = await prisma.room.findMany({
				where: { tournament },
				select: { name: true },
			});
			const roomIds = tournamentRooms.map((r) => r.name);
			if (roomIds.length === 0) return [];

			const users = await prisma.user.findMany({
				select: { id: true, name: true },
			});

			if (users.length === 0) return [];

			const allUserIds = users.map((user) => user.id);

			const [totalRaw, exactRaw, predictedRaw, finishedMatchesRaw] =
				await Promise.all([
					prisma.bet.groupBy({
						by: ["userId", "roomId"],
						where: { roomId: { in: roomIds }, points: { not: null } },
						_sum: { points: true, bonusPoints: true },
					}),
					prisma.bet.groupBy({
						by: ["userId", "roomId"],
						where: { roomId: { in: roomIds }, points: 3 },
						_count: { _all: true },
					}),
					prisma.bet.groupBy({
						by: ["userId", "roomId"],
						where: { roomId: { in: roomIds }, points: { gte: 1 } },
						_count: { _all: true },
					}),
					prisma.bet.findMany({
						where: { roomId: { in: roomIds }, points: { not: null } },
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

import { prisma } from "@/lib/prisma";
import type { StatSection, TableRow } from "@/types/api";

function buildRows(
	aggregated: { userId: string; value: number }[],
	nameMap: Map<string, string>,
	currentUserId: string,
	allUserIds: string[]
): TableRow[] {
	const scoredIds = new Set(aggregated.map((r) => r.userId));
	const zeroEntries = allUserIds
		.filter((id) => !scoredIds.has(id))
		.map((id) => ({ userId: id, value: 0 }));
	return [...aggregated, ...zeroEntries]
		.sort((a, b) => b.value - a.value)
		.map((entry, i) => ({
			position: i + 1,
			name: nameMap.get(entry.userId) ?? entry.userId,
			score: entry.value,
			isCurrentUser: entry.userId === currentUserId,
		}));
}

export const RoomStatisticService = {
	async getSections(
		roomId: string,
		currentUserId: string
	): Promise<StatSection[]> {
		// Run all 4 aggregations + room members query in parallel
		const [roomUsers, totalScoreRaw, exactHitsRaw, predictedWinsRaw, avgRaw] =
			await Promise.all([
				// All users currently in this room (base set — always shown with 0 if no bets scored)
				prisma.user.findMany({
					where: { currentRoom: roomId },
					select: { id: true, name: true },
				}),
				// Total score = sum(points + bonusPoints) per user
				prisma.bet.groupBy({
					by: ["userId"],
					where: { roomId, points: { not: null } },
					_sum: { points: true, bonusPoints: true },
				}),
				// Exact score hits = count where points = 3
				prisma.bet.groupBy({
					by: ["userId"],
					where: { roomId, points: 3 },
					_count: { _all: true },
				}),
				// Predicted wins = count where points >= 1 (correct outcome)
				prisma.bet.groupBy({
					by: ["userId"],
					where: { roomId, points: { gte: 1 } },
					_count: { _all: true },
				}),
				// Avg points per finished match
				prisma.bet.groupBy({
					by: ["userId"],
					where: { roomId, points: { not: null } },
					_avg: { points: true },
				}),
			]);

		// All participant user IDs (base set — everyone who placed a bet)
		const allUserIds = roomUsers.map((u) => u.id);

		if (allUserIds.length === 0) return [];

		// Build name map directly from room members (already fetched)
		const nameMap = new Map(roomUsers.map((u) => [u.id, u.name ?? u.id]));

		// Build rows for each section
		const totalScoreRows = buildRows(
			totalScoreRaw.map((r) => ({
				userId: r.userId,
				value: (r._sum.points ?? 0) + (r._sum.bonusPoints ?? 0),
			})),
			nameMap,
			currentUserId,
			allUserIds
		);

		const exactHitsRows = buildRows(
			exactHitsRaw.map((r) => ({
				userId: r.userId,
				value: r._count._all,
			})),
			nameMap,
			currentUserId,
			allUserIds
		);

		const predictedWinsRows = buildRows(
			predictedWinsRaw.map((r) => ({
				userId: r.userId,
				value: r._count._all,
			})),
			nameMap,
			currentUserId,
			allUserIds
		);

		const avgRows = buildRows(
			avgRaw.map((r) => ({
				userId: r.userId,
				value: Math.round((r._avg.points ?? 0) * 100) / 100,
			})),
			nameMap,
			currentUserId,
			allUserIds
		);

		return [
			{ title: "Total Score", rows: totalScoreRows },
			{ title: "Exact Score Hits", rows: exactHitsRows },
			{ title: "Predicted Wins", rows: predictedWinsRows },
			{ title: "Average Points per Match", rows: avgRows },
		];
	},
};

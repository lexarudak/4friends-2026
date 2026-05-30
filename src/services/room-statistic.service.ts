import { prisma } from "@/lib/prisma";
import type { StatSection, TableRow } from "@/types/api";
import { getCompetitionPosition } from "@/utils/ranking";

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
	const sorted = [...aggregated, ...zeroEntries].sort(
		(a, b) => b.value - a.value
	);
	const sortedValues = sorted.map((entry) => entry.value);

	return sorted.map((entry, i) => ({
		position: getCompetitionPosition(sortedValues, i),
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
		try {
			return await getSectionsInternal(roomId, currentUserId);
		} catch (err) {
			console.error("[RoomStatisticService.getSections]", err);
			return [];
		}
	},
};

async function getSectionsInternal(
	roomId: string,
	currentUserId: string
): Promise<StatSection[]> {
	const [
		roomMemberships,
		totalScoreRaw,
		exactHitsRaw,
		predictedWinsRaw,
		finishedMatchesRaw,
	] = await Promise.all([
		prisma.userRoom.findMany({
			where: {
				room: {
					name: roomId,
				},
			},
			select: {
				user: {
					select: { id: true, name: true },
				},
			},
		}),
		prisma.bet.groupBy({
			by: ["userId"],
			where: { roomId, points: { not: null } },
			_sum: { points: true, bonusPoints: true },
		}),
		prisma.bet.groupBy({
			by: ["userId"],
			where: { roomId, points: 3 },
			_count: { _all: true },
		}),
		prisma.bet.groupBy({
			by: ["userId"],
			where: { roomId, points: { gte: 1 } },
			_count: { _all: true },
		}),
		prisma.bet.findMany({
			where: { roomId, points: { not: null } },
			select: { matchId: true },
			distinct: ["matchId"],
		}),
	]);

	const roomUsers = roomMemberships.map((membership) => membership.user);
	const allUserIds = roomUsers.map((u) => u.id);
	if (allUserIds.length === 0) return [];

	const nameMap = new Map(
		roomUsers.map((u) => [u.id, u.name ?? u.id.split("@")[0]])
	);

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

	const finishedMatchCount = finishedMatchesRaw.length;
	const avgRows = buildRows(
		totalScoreRaw.map((r) => ({
			userId: r.userId,
			value:
				finishedMatchCount > 0
					? Math.round(
							(((r._sum.points ?? 0) + (r._sum.bonusPoints ?? 0)) /
								finishedMatchCount) *
								100
						) / 100
					: 0,
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
}

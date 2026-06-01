import { prisma } from "@/lib/prisma";
import type { StatSection, TableRow } from "@/types/api";
import { getCompetitionPosition } from "@/utils/ranking";
import type { StatLabels } from "@/i18n/dictionary";

const DEFAULT_LABELS: StatLabels = {
	totalScore: "Total Score",
	exactHits: "Exact Score Hits",
	predictedWins: "Predicted Wins",
	avgPerMatch: "Average Points per Match",
};

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
	bestByUser: Map<string, BestEntry>,
	fallbackRoomByUser: Map<string, string>
): Map<string, BestEntry> {
	const result = new Map<string, BestEntry>();

	for (const userId of userIds) {
		result.set(
			userId,
			bestByUser.get(userId) ?? {
				value: 0,
				roomId: fallbackRoomByUser.get(userId) ?? "",
			}
		);
	}

	return result;
}

export const GlobalTopService = {
	async getSections(
		tournament: string,
		currentUserId?: string,
		labels: StatLabels = DEFAULT_LABELS
	): Promise<StatSection[]> {
		try {
			const tournamentRooms = await prisma.room.findMany({
				where: { tournament },
				select: { name: true },
			});
			const roomIds = tournamentRooms.map((r) => r.name);
			if (roomIds.length === 0) return [];

			// Participants of this tournament = UserRoom members PLUS anyone who
			// has placed a bet in one of its rooms (bets don't require a
			// membership row to exist, e.g. seeded data).
			const [memberships, betParticipants] = await Promise.all([
				prisma.userRoom.findMany({
					where: { room: { tournament } },
					select: {
						userId: true,
						joinedAt: true,
						user: { select: { name: true } },
						room: { select: { name: true } },
					},
					orderBy: { joinedAt: "asc" },
				}),
				prisma.bet.findMany({
					where: { roomId: { in: roomIds } },
					select: { userId: true, roomId: true, user: { select: { name: true } } },
					distinct: ["userId", "roomId"],
				}),
			]);

			const nameMap = new Map<string, string>();
			// Fallback room = first room the user is associated with in this tournament.
			const membershipRoomByUser = new Map<string, string>();

			const register = (userId: string, roomName: string, name: string | null) => {
				if (!membershipRoomByUser.has(userId)) {
					membershipRoomByUser.set(userId, roomName);
				}
				if (!nameMap.has(userId)) {
					nameMap.set(userId, name ?? userId.split("@")[0]);
				}
			};

			for (const m of memberships) register(m.userId, m.room.name, m.user.name);
			for (const b of betParticipants) {
				register(b.userId, b.roomId, b.user.name);
			}

			const allUserIds = [...membershipRoomByUser.keys()];
			if (allUserIds.length === 0) return [];

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

			// Fallback room: prefer the room that gave the user their best Total
			// Score; otherwise fall back to their tournament room membership.
			const fallbackRoomByUser = new Map(membershipRoomByUser);
			for (const [userId, entry] of totalBest.entries()) {
				if (entry.roomId) fallbackRoomByUser.set(userId, entry.roomId);
			}

			return [
				{
					title: labels.totalScore,
					rows: toRows(
						withZeroDefaults(allUserIds, totalBest, fallbackRoomByUser),
						nameMap,
						currentUserId
					),
				},
				{
					title: labels.exactHits,
					rows: toRows(
						withZeroDefaults(allUserIds, exactBest, fallbackRoomByUser),
						nameMap,
						currentUserId
					),
				},
				{
					title: labels.predictedWins,
					rows: toRows(
						withZeroDefaults(allUserIds, predictedBest, fallbackRoomByUser),
						nameMap,
						currentUserId
					),
				},
				{
					title: labels.avgPerMatch,
					rows: toRows(
						withZeroDefaults(allUserIds, avgBest, fallbackRoomByUser),
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

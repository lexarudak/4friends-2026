import type { ScoreTableData, TableRow } from "@/types/api";
import { prisma } from "@/lib/prisma";
import { getCompetitionPosition } from "@/utils/ranking";

export const TableService = {
	async getTopTable(
		roomId: string,
		userId: string,
		userName: string,
		topN = 3
	): Promise<ScoreTableData> {
		const [roomUsers, totals] = await Promise.all([
			prisma.user.findMany({
				where: { currentRoom: roomId },
				select: { id: true, name: true },
			}),
			prisma.bet.groupBy({
				by: ["userId"],
				where: { roomId, points: { not: null } },
				_sum: { points: true, bonusPoints: true },
			}),
		]);

		const scoreByUser = new Map(
			totals.map((row) => [
				row.userId,
				(row._sum.points ?? 0) + (row._sum.bonusPoints ?? 0),
			])
		);

		const users = new Map(
			roomUsers.map((user) => [user.id, user.name ?? user.id.split("@")[0]])
		);

		if (!users.has(userId)) {
			users.set(userId, userName || userId.split("@")[0]);
		}

		const sorted = [...users.entries()]
			.map(([id, name]) => ({
				userId: id,
				name,
				score: scoreByUser.get(id) ?? 0,
			}))
			.sort((a, b) => b.score - a.score);
		const sortedScores = sorted.map((entry) => entry.score);

		const rows: TableRow[] = sorted.slice(0, topN).map((entry, i) => ({
			position: getCompetitionPosition(sortedScores, i),
			name: entry.name,
			score: entry.score,
			isCurrentUser: entry.userId === userId,
		}));

		const userIndex = sorted.findIndex((e) => e.userId === userId);
		const userInTop = userIndex !== -1 && userIndex < topN;

		const currentUserRow: TableRow | undefined =
			!userInTop && userIndex !== -1
				? {
						position: getCompetitionPosition(sortedScores, userIndex),
						name: sorted[userIndex].name,
						score: sorted[userIndex].score,
						isCurrentUser: true,
					}
				: undefined;

		return { rows, currentUserRow };
	},
};

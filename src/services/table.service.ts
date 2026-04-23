import type { ScoreTableData, TableRow } from "@/types/api";
import { getRoomScores } from "@/db/scores";

export const TableService = {
	async getTopTable(
		roomId: string,
		userId: string,
		userName: string,
		topN = 3
	): Promise<ScoreTableData> {
		const scores = getRoomScores(roomId).map((e) =>
			e.userId === "__current_user__"
				? { ...e, userId, name: userName || e.name }
				: e
		);
		const sorted = [...scores].sort((a, b) => b.score - a.score);

		const rows: TableRow[] = sorted.slice(0, topN).map((entry, i) => ({
			position: i + 1,
			name: entry.name,
			score: entry.score,
			isCurrentUser: entry.userId === userId,
		}));

		const userIndex = sorted.findIndex((e) => e.userId === userId);
		const userInTop = userIndex !== -1 && userIndex < topN;

		const currentUserRow: TableRow | undefined =
			!userInTop && userIndex !== -1
				? {
						position: userIndex + 1,
						name: sorted[userIndex].name,
						score: sorted[userIndex].score,
						isCurrentUser: true,
					}
				: undefined;

		return { rows, currentUserRow };
	},
};

import { auth } from "@/auth";
import { getActiveRoomId } from "@/lib/active-room";
import { TableService } from "@/services/table.service";
import { ScoreTable } from "@/components/widgets/score-table";

export const TopTable = async () => {
	const session = await auth();
	const userId = session?.user?.email ?? "";
	const userName = session?.user?.name ?? "me";
	const roomId = (await getActiveRoomId()) ?? "default";

	const data = await TableService.getTopTable(roomId, userId, userName, 3);

	return (
		<ScoreTable
			title="Top 3"
			rows={data.rows}
			currentUserRow={data.currentUserRow}
			href="#"
			linkLabel="More statistic"
		/>
	);
};

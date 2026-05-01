import { RoomStatisticService } from "@/services/room-statistic.service";
import { getActiveRoomId } from "@/lib/active-room";
import { PaginatedTable } from "@/components/features/paginated-table";
import { PageTitle } from "@/components/shared/page-title";
import { auth } from "@/auth";
import styles from "./page.module.scss";

export default async function RoomStatisticPage() {
	const session = await auth();
	const roomId = await getActiveRoomId();
	const sections =
		roomId && session?.user?.email
			? await RoomStatisticService.getSections(roomId, session.user.email)
			: [];

	return (
		<div className={styles.page}>
			<PageTitle title="Statistic" label="Room overview" />
			{sections.length === 0 ? (
				<p className={styles.empty}>No data yet — place some bets first.</p>
			) : (
				<div className={styles.sections}>
					{sections.map((section) => (
						<PaginatedTable
							key={section.title}
							title={section.title}
							rows={section.rows}
							pageSize={10}
						/>
					))}
				</div>
			)}
		</div>
	);
}

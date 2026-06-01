import { RoomStatisticService } from "@/services/room-statistic.service";
import { getActiveRoomId } from "@/lib/active-room";
import { PaginatedTable } from "@/components/features/paginated-table";
import { PageTitle } from "@/components/shared/page-title";
import { auth } from "@/auth";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionary";
import styles from "./page.module.scss";

export default async function RoomStatisticPage() {
	const session = await auth();
	const roomId = await getActiveRoomId();
	const t = getDictionary(await getLocale());
	const sections =
		roomId && session?.user?.email
			? await RoomStatisticService.getSections(
					roomId,
					session.user.email,
					t.stats
				)
			: [];

	console.info("[room-statistic:page] response", {
		roomId,
		userId: session?.user?.email ?? null,
		sectionsCount: sections.length,
	});

	return (
		<div className={styles.page}>
			<PageTitle title={t.stats.statistic} label={t.stats.roomOverview} />
			{sections.length === 0 ? (
				<p className={styles.empty}>{t.stats.noData}</p>
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

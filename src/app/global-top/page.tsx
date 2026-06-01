import { GlobalTopService } from "@/services/global-top.service";
import { PaginatedTable } from "@/components/features/paginated-table";
import { PageTitle } from "@/components/shared/page-title";
import { CrownIcon } from "@/components/icons";
import { auth } from "@/auth";
import { getActiveRoomTournament } from "@/lib/active-room";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionary";
import styles from "./page.module.scss";

export default async function GlobalTopPage() {
	const session = await auth();
	const userId = session?.user?.email ?? undefined;
	const tournament = await getActiveRoomTournament();
	const t = getDictionary(await getLocale());
	const sections = await GlobalTopService.getSections(
		tournament,
		userId,
		t.stats
	);

	return (
		<div className={styles.page}>
			<PageTitle
				title={t.stats.globalTopTitle}
				label={t.stats.rankingAllRooms}
				icon={<CrownIcon />}
			/>
			{sections.length === 0 ? (
				<p className={styles.empty}>{t.stats.usersSoon}</p>
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

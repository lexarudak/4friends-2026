import { GlobalTopService } from "@/services/global-top.service";
import { PaginatedTable } from "@/components/features/paginated-table";
import { PageTitle } from "@/components/shared/page-title";
import { CrownIcon } from "@/components/icons";
import { auth } from "@/auth";
import { getActiveRoomTournament } from "@/lib/active-room";
import styles from "./page.module.scss";

const TOURNAMENT_LABELS: Record<string, string> = {
	wc2026: "FIFA World Cup 2026",
	ucl2526: "UEFA Champions League 25/26",
};

export default async function GlobalTopPage() {
	const session = await auth();
	const userId = session?.user?.email ?? undefined;
	const tournament = await getActiveRoomTournament();
	const sections = await GlobalTopService.getSections(tournament, userId);
	const tournamentLabel = TOURNAMENT_LABELS[tournament] ?? tournament;

	return (
		<div className={styles.page}>
			<PageTitle
				title="Global Top"
				label={tournamentLabel}
				icon={<CrownIcon />}
			/>
			{sections.length === 0 ? (
				<p className={styles.empty}>
					No data yet — users will appear here soon.
				</p>
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

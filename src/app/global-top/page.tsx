import { GlobalTopService } from "@/services/global-top.service";
import { PaginatedTable } from "@/components/features/paginated-table";
import { PageTitle } from "@/components/shared/page-title";
import { CrownIcon } from "@/components/icons";
import { auth } from "@/auth";
import { getActiveRoomTournament } from "@/lib/active-room";
import { getTournamentLabel } from "@/lib/tournaments";
import styles from "./page.module.scss";

export default async function GlobalTopPage() {
	const session = await auth();
	const userId = session?.user?.email ?? undefined;
	const tournament = await getActiveRoomTournament();
	const sections = await GlobalTopService.getSections(tournament, userId);
	const tournamentLabel = getTournamentLabel(tournament);

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

import { PageTitle } from "@/components/shared/page-title";
import { TournamentBracket } from "@/components/features/tournament-bracket";
import { WorldCupService } from "@/services/world-cup.service";
import { getActiveRoomTournament } from "@/lib/active-room";
import { getTournamentLabel } from "@/lib/tournaments";
import styles from "./page.module.scss";

export const metadata = {
	title: "Tournament | 4friends",
};

export default async function WorldCupPage() {
	const tournament = await getActiveRoomTournament();
	const { groups, knockout } = await WorldCupService.getTournamentData(
		tournament
	);

	return (
		<div className={styles.page}>
			<PageTitle label={getTournamentLabel(tournament)} title="Tournament" />
			<div className={styles.content}>
				<TournamentBracket groups={groups} knockout={knockout} />
			</div>
		</div>
	);
}

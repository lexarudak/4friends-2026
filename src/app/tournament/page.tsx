import { PageTitle } from "@/components/shared/page-title";
import { TournamentBracket } from "@/components/features/tournament-bracket";
import { WorldCupService } from "@/services/world-cup.service";
import { getActiveRoomTournament } from "@/lib/active-room";
import { getTournament } from "@/lib/tournaments";
import styles from "./page.module.scss";

export const metadata = {
	title: "Tournament | 4friends",
};

export default async function WorldCupPage() {
	const slug = await getActiveRoomTournament();
	const tournament = getTournament(slug);
	const { groups, thirdPlace, knockout } =
		await WorldCupService.getTournamentData(slug);

	return (
		<div className={styles.page}>
			<PageTitle
				label="Tournament"
				title={tournament.title}
				subtitle={tournament.meta.join("  •  ")}
			/>
			<div className={styles.content}>
				<TournamentBracket
					groups={groups}
					thirdPlace={thirdPlace}
					knockout={knockout}
				/>
			</div>
		</div>
	);
}

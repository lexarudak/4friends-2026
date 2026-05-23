import { PageTitle } from "@/components/shared/page-title";
import { TournamentBracket } from "@/components/features/tournament-bracket";
import { WorldCupService } from "@/services/world-cup.service";
import styles from "./page.module.scss";

export const metadata = {
	title: "FIFA World Cup 2026™ | 4friends",
};

export default async function WorldCupPage() {
	const { groups, knockout } = await WorldCupService.getTournamentData();

	return (
		<div className={styles.page}>
			<PageTitle label="FIFA World Cup 2026™" title="Tournament" />
			<div className={styles.content}>
				<TournamentBracket groups={groups} knockout={knockout} />
			</div>
		</div>
	);
}

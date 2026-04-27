import { PageTitle } from "@/components/shared/page-title";
import { TournamentBracket } from "@/components/features/tournament-bracket";
import { WC_GROUPS } from "@/db/world-cup";
import styles from "./page.module.scss";

export const metadata = {
	title: "FIFA World Cup 2026™ | 4friends",
};

export default function WorldCupPage() {
	return (
		<div className={styles.page}>
			<PageTitle label="FIFA World Cup 2026™" title="Tournament" />
			<div className={styles.content}>
				<TournamentBracket groups={WC_GROUPS} />
			</div>
		</div>
	);
}

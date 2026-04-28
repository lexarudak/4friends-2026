import { getLiveMatches } from "@/db/live-matches";
import { ScheduleMatchCard } from "@/components/widgets/schedule-match-card";
import styles from "./live-section.module.scss";

export function LiveSection() {
	const matches = getLiveMatches();

	if (matches.length === 0) return null;

	return (
		<section className={styles.section}>
			<h2 className={styles.title}>
				<span className={styles.dot} />
				Live
			</h2>
			{matches.map((match) => (
				<ScheduleMatchCard key={match.id} match={match} />
			))}
		</section>
	);
}

import { ScheduleService } from "@/services/schedule.service";
import { getActiveRoomId, getActiveRoomTournament } from "@/lib/active-room";
import { ScheduleMatchCard } from "@/components/widgets/schedule-match-card";
import styles from "./live-section.module.scss";

export async function LiveSection() {
	const roomId = await getActiveRoomId();
	const tournament = await getActiveRoomTournament();
	const allMatches = await ScheduleService.getScheduleMatches(
		tournament,
		roomId ?? undefined
	);
	const matches = allMatches.filter((m) => m.status === "live");

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

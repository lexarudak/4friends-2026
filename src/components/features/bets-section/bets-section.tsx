import { auth } from "@/auth";
import { getActiveRoomId, getActiveRoomTournament } from "@/lib/active-room";
import { MatchService } from "@/services/match.service";
import { BetsService } from "@/services/bets.service";
import { BetsForm } from "@/components/features/bets-form";
import styles from "./bets-section.module.scss";
import { cn } from "@/utils/lib";

type Props = {
	className?: string;
};

export async function BetsSection({ className }: Props) {
	const [session, tournament] = await Promise.all([
		auth(),
		getActiveRoomTournament(),
	]);
	const matches = await MatchService.getMatches(tournament);

	const userId = session?.user?.email;
	const roomId = await getActiveRoomId();
	const initialBets =
		userId && roomId ? await BetsService.getBets(userId, roomId) : [];

	return (
		<section className={cn(styles.container, className)}>
			<h2 className={styles.title}>Next matches</h2>
			{matches.length === 0 ? (
				<p className={styles.empty}>No upcoming matches. Check back later.</p>
			) : (
				<BetsForm matches={matches} initialBets={initialBets} />
			)}
		</section>
	);
}

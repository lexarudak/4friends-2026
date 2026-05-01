import { auth } from "@/auth";
import { getActiveRoomId } from "@/lib/active-room";
import { MatchService } from "@/services/match.service";
import { BetsService } from "@/services/bets.service";
import { BetsForm } from "@/components/features/bets-form";
import styles from "./bets-section.module.scss";
import { cn } from "@/utils/lib";

type Props = {
	className?: string;
};

export async function BetsSection({ className }: Props) {
	const [session, matches] = await Promise.all([
		auth(),
		Promise.resolve(MatchService.getMatches()),
	]);

	const userId = session?.user?.email;
	const roomId = await getActiveRoomId();
	const initialBets =
		userId && roomId ? await BetsService.getBets(userId, roomId) : [];

	return (
		<section className={cn(styles.container, className)}>
			<h2 className={styles.title}>Next matches</h2>
			<BetsForm matches={matches} initialBets={initialBets} />
		</section>
	);
}

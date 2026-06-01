import { auth } from "@/auth";
import { getActiveRoomId, getActiveRoomTournament } from "@/lib/active-room";
import { MatchService } from "@/services/match.service";
import { BetsService } from "@/services/bets.service";
import { BetsForm } from "@/components/features/bets-form";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionary";
import styles from "./bets-section.module.scss";
import { cn } from "@/utils/lib";

type Props = {
	className?: string;
};

export async function BetsSection({ className }: Props) {
	const [session, tournament, locale] = await Promise.all([
		auth(),
		getActiveRoomTournament(),
		getLocale(),
	]);
	const t = getDictionary(locale);
	const matches = await MatchService.getMatches(tournament);

	const userId = session?.user?.email;
	const roomId = await getActiveRoomId();
	const initialBets =
		userId && roomId ? await BetsService.getBets(userId, roomId) : [];

	return (
		<section className={cn(styles.container, className)}>
			<h2 className={styles.title}>{t.home.nextMatches}</h2>
			{matches.length === 0 ? (
				<p className={styles.empty}>{t.home.noUpcoming}</p>
			) : (
				<BetsForm matches={matches} initialBets={initialBets} />
			)}
		</section>
	);
}

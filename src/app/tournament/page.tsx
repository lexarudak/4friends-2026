import { PageTitle } from "@/components/shared/page-title";
import { TournamentBracket } from "@/components/features/tournament-bracket";
import { GroupStanding } from "@/components/widgets/group-standing";
import { WorldCupService } from "@/services/world-cup.service";
import { getActiveRoomTournament } from "@/lib/active-room";
import { getTournament } from "@/lib/tournaments";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionary";
import styles from "./page.module.scss";

export const metadata = {
	title: "Tournament | 4friends",
};

export default async function WorldCupPage() {
	const slug = await getActiveRoomTournament();
	const tournament = getTournament(slug);
	const t = getDictionary(await getLocale());
	const { groups, thirdPlace, knockout } =
		await WorldCupService.getTournamentData(slug);

	return (
		<div className={styles.page}>
			<PageTitle
				label={t.tournament.label}
				title={tournament.title}
				subtitle={tournament.meta.join("  •  ")}
			/>
			<div className={styles.content}>
				{tournament.format === "league" ? (
					groups.length === 0 ? (
						<p className={styles.empty}>{t.tournament.noStandingsYet}</p>
					) : (
						groups.map((group) => (
							<GroupStanding
								key={group.name}
								group={group}
								rankColors={false}
							/>
						))
					)
				) : (
					<TournamentBracket
						groups={groups}
						thirdPlace={thirdPlace}
						knockout={knockout}
					/>
				)}
			</div>
		</div>
	);
}

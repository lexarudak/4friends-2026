import type { FC } from "react";
import type { LiveMatch } from "@/db/live-matches";
import { calcMatchPoints } from "@/db/live-matches";
import { PaginatedTable } from "@/components/features/paginated-table";
import styles from "./live-match-card.module.scss";

type Props = {
	match: LiveMatch;
};

export const LiveMatchCard: FC<Props> = ({ match }) => {
	const rows = match.bets
		.map((bet) => ({
			userId: bet.userId,
			pts: calcMatchPoints(
				bet.betHome,
				bet.betAway,
				match.currentHome,
				match.currentAway
			),
			bet,
		}))
		.sort((a, b) => b.pts - a.pts || a.bet.name.localeCompare(b.bet.name))
		.map((entry, i) => ({
			position: i + 1,
			tag: `${entry.bet.betHome}:${entry.bet.betAway}`,
			name: entry.bet.name,
			score: entry.pts,
			isCurrentUser: entry.userId === "__current_user__",
		}));

	return (
		<div className={styles.card}>
			{/* Match header */}
			<div className={styles.matchHeader}>
				<span className={styles.group}>Group {match.group}</span>
				<span className={styles.status}>In Play</span>
				<span className={styles.minute}>{match.minute}&apos;</span>
			</div>

			{/* Match score */}
			<div className={styles.matchScore}>
				<span className={styles.teamHome}>
					<span className={styles.teamName}>{match.homeTeam}</span>
				</span>
				<span className={styles.score}>
					<span className={styles.scoreFlag}>{match.homeFlag}</span>
					{match.currentHome}&nbsp;:&nbsp;{match.currentAway}
					<span className={styles.scoreFlag}>{match.awayFlag}</span>
				</span>
				<span className={styles.teamAway}>
					<span className={styles.teamName}>{match.awayTeam}</span>
				</span>
			</div>

			{/* Bets table */}
			<PaginatedTable
				rows={rows}
				pageSize={5}
				tableClassName={styles.betsTable}
				hidePosition
			/>
		</div>
	);
};

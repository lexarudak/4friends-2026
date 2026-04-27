import type { FC } from "react";
import { TeamBadge } from "@/components/shared/team-badge";
import { PaginatedTable } from "@/components/features/paginated-table";
import styles from "./schedule-match-card.module.scss";

export type ScheduleBet = {
	userId: string;
	name: string;
	betHome: number;
	betAway: number;
	points?: number | null;
};

export type ScheduleMatch = {
	id: string;
	group: string;
	time: string;
	date: string;
	home: { name: string; flag: string };
	away: { name: string; flag: string };
	/** null = not started, number = final or live score */
	resultHome?: number | null;
	resultAway?: number | null;
	/** "upcoming" | "live" | "finished" */
	status?: "upcoming" | "live" | "finished";
	minute?: number | null;
	bets?: ScheduleBet[];
};

type Props = {
	match: ScheduleMatch;
};

export const ScheduleMatchCard: FC<Props> = ({ match }) => {
	const status = match.status ?? "upcoming";
	const hasBets = match.bets && match.bets.length > 0;
	const hasResult = match.resultHome != null && match.resultAway != null;

	const getBetStatus = (bet: ScheduleBet) => {
		if (!hasResult) return "pending";
		if (bet.betHome === match.resultHome && bet.betAway === match.resultAway) return "exact";
		const betOutcome = Math.sign(bet.betHome - bet.betAway);
		const realOutcome = Math.sign(match.resultHome! - match.resultAway!);
		if (betOutcome === realOutcome) return "win";
		return "miss";
	};

	const sortedBets = hasBets
		? [...match.bets!].sort((a, b) => (b.points ?? -1) - (a.points ?? -1))
		: [];

	const betRows = sortedBets.map((bet, i) => ({
		position: i + 1,
		tag: `${bet.betHome}:${bet.betAway}`,
		name: bet.name,
		score: bet.points ?? 0,
		status: getBetStatus(bet),
	}));

	return (
		<div className={styles.card} data-status={status}>
			{/* Header row */}
			<div className={styles.header}>
				<span className={styles.group}>{match.group}</span>
				<span className={styles.statusLabel}>
					{status === "live"
						? "In Play"
						: status === "finished"
							? "Finished"
							: match.time}
				</span>
				{status === "live" && match.minute != null && (
					<span className={styles.minute}>{match.minute}&apos;</span>
				)}
				{status !== "live" && (
					<span className={styles.date}>{match.date}</span>
				)}
			</div>

			{/* Score row */}
			<div className={styles.score}>
				<TeamBadge
					name={match.home.name}
					flag={match.home.flag}
					direction="rtl"
					className={styles.team}
				/>
				<span className={styles.result}>
					{match.resultHome != null && match.resultAway != null
						? `${match.resultHome} : ${match.resultAway}`
						: "- : -"}
				</span>
				<TeamBadge
					name={match.away.name}
					flag={match.away.flag}
					className={styles.team}
				/>
			</div>

			{/* Bets table */}
			{hasBets && (
				<PaginatedTable
					rows={betRows}
					pageSize={5}
					tableClassName={styles.betsTable}
					hidePosition
				/>
			)}
		</div>
	);
};

import type { FC, ReactNode } from "react";
import type { BetItemResultData } from "./bet-item-result";
import { cn } from "@/utils/lib";
import styles from "./bet-item.module.scss";
import { TeamBadge } from "@/components/shared/team-badge/team-badge";
import { LocalDateTime } from "@/components/shared/local-datetime/local-datetime";

export type BetItemStatus = "pending" | "exact" | "win" | "miss";

type Props = {
	group: string;
	homeTeam: string;
	homeFlag: string;
	awayTeam: string;
	awayFlag: string;
	betHome?: number;
	betAway?: number;
	scoreSlot?: ReactNode;
	detailsSlot?: ReactNode;
	/** ISO timestamp; when set, time/date render in the user's tz (falling back
	 * to the `time`/`date` strings before mount). */
	dateIso?: string;
	time: string;
	date: string;
	status: BetItemStatus | string;
	result?: BetItemResultData | null;
	className?: string;
};

export const BetItem: FC<Props> = ({
	group,
	homeTeam,
	homeFlag,
	awayTeam,
	awayFlag,
	betHome,
	betAway,
	scoreSlot,
	detailsSlot,
	dateIso,
	time,
	date,
	status,
	result,
	className,
}) => {
	return (
		<li
			className={cn(styles.row, className)}
			data-status={status}
			data-points={result?.points ?? undefined}
			data-show-result={!!result || undefined}
		>
			<div className={styles.header}>
				<span className={styles.group}>{group}</span>
				<span className={styles.meta}>
					{dateIso ? (
						<>
							<LocalDateTime
								iso={dateIso}
								mode="time"
								fallback={time}
								className={styles.time}
							/>
							<LocalDateTime
								iso={dateIso}
								mode="date"
								fallback={date}
								className={styles.date}
							/>
						</>
					) : (
						<>
							<span className={styles.time}>{time}</span>
							<span className={styles.date}>{date}</span>
						</>
					)}
				</span>
			</div>

			<div className={styles.rowsGrid}>
				{result && (
					<div className={styles.pointsCol}>
						{result.points != null ? (
							<>
								<span className={styles.pointsValue}>{result.points}</span>
								<span className={styles.pointsLabel}>pts</span>
							</>
						) : (
							<span className={styles.pointsDash}>—</span>
						)}
					</div>
				)}
				{result ? (
					<div
						className={styles.resultBetsGrid}
						data-playoff={result.winner != null || undefined}
					>
						<div className={styles.resultColHeader}>
							<span className={styles.resultLabel}>Result</span>
						</div>
						<div className={styles.betsColHeader}>
							<span className={styles.betsLabel}>Bets</span>
						</div>
						<div className={styles.resultRow}>
							{result.winner != null && (
								<span
									className={cn(
										styles.winnerDot,
										result.winner === "home"
											? styles.winnerDotActive
											: undefined
									)}
								/>
							)}
							<span className={styles.resultScore}>
								{result.home != null ? result.home : "–"}
							</span>
						</div>
						<div className={styles.teamRow}>
							{result.winner != null && (
								<span
									className={cn(
										styles.winnerDot,
										result.winner === "home"
											? styles.winnerDotActive
											: undefined
									)}
								/>
							)}
							<span className={styles.bet}>{scoreSlot ?? betHome}</span>
							<TeamBadge
								name={homeTeam}
								flag={homeFlag}
								size="s"
								className={styles.teamBadge}
							/>
						</div>
						<div className={styles.resultRow}>
							{result.winner != null && (
								<span
									className={cn(
										styles.winnerDot,
										result.winner === "away"
											? styles.winnerDotActive
											: undefined
									)}
								/>
							)}
							<span className={styles.resultScore}>
								{result.away != null ? result.away : "–"}
							</span>
						</div>
						<div className={styles.teamRow}>
							{result.winner != null && (
								<span
									className={cn(
										styles.winnerDot,
										result.winner === "away"
											? styles.winnerDotActive
											: undefined
									)}
								/>
							)}
							<span className={styles.bet}>{scoreSlot ?? betAway}</span>
							<TeamBadge
								name={awayTeam}
								flag={awayFlag}
								size="s"
								className={styles.teamBadge}
							/>
						</div>
					</div>
				) : (
					<div className={styles.betsCol}>
						<div className={styles.teamRow}>
							<span className={styles.bet}>{scoreSlot ?? betHome}</span>
							<TeamBadge
								name={homeTeam}
								flag={homeFlag}
								size="s"
								className={styles.teamBadge}
							/>
						</div>
						<div className={styles.teamRow}>
							<span className={styles.bet}>{scoreSlot ?? betAway}</span>
							<TeamBadge
								name={awayTeam}
								flag={awayFlag}
								size="s"
								className={styles.teamBadge}
							/>
						</div>
					</div>
				)}
			</div>

			{detailsSlot ? <div className={styles.details}>{detailsSlot}</div> : null}
		</li>
	);
};

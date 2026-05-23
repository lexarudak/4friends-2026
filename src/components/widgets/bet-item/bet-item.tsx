import type { FC, ReactNode } from "react";
import type { BetItemResultData } from "./bet-item-result";
import { cn } from "@/utils/lib";
import styles from "./bet-item.module.scss";

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
				<span className={styles.group}>Group {group}</span>
				<span className={styles.meta}>
					<span className={styles.time}>{time}</span>
					<span className={styles.date}>{date}</span>
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
							<span className={styles.flag}>{homeFlag}</span>
							<span className={styles.teamName}>{homeTeam}</span>
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
							<span className={styles.flag}>{awayFlag}</span>
							<span className={styles.teamName}>{awayTeam}</span>
						</div>
					</div>
				) : (
					<div className={styles.betsCol}>
						<div className={styles.teamRow}>
							<span className={styles.bet}>{scoreSlot ?? betHome}</span>
							<span className={styles.flag}>{homeFlag}</span>
							<span className={styles.teamName}>{homeTeam}</span>
						</div>
						<div className={styles.teamRow}>
							<span className={styles.bet}>{scoreSlot ?? betAway}</span>
							<span className={styles.flag}>{awayFlag}</span>
							<span className={styles.teamName}>{awayTeam}</span>
						</div>
					</div>
				)}
			</div>

			{detailsSlot ? <div className={styles.details}>{detailsSlot}</div> : null}
		</li>
	);
};

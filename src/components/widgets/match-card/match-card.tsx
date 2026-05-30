import type { ChangeEvent, FC } from "react";
import type { Match } from "@/types/api";
import { ScoreInput } from "@/components/shared/score-input";
import { cn } from "@/utils/lib";
import styles from "./match-card.module.scss";
import { TeamBadge } from "@/components/shared/team-badge/team-badge";

export type CardStatus = "default" | "dirty" | "saved" | "error";

type Props = {
	match: Match;
	homeFieldName: string;
	awayFieldName: string;
	winnerFieldName: string;
	homeValue: string;
	awayValue: string;
	winnerValue: "" | "home" | "away";
	isPlayoff?: boolean;
	winnerDisabled?: boolean;
	onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
	onScoreChange?: (side: "home" | "away", value: string) => void;
	status?: CardStatus;
	className?: string;
};

export const MatchCard: FC<Props> = ({
	match,
	homeFieldName,
	awayFieldName,
	winnerFieldName,
	homeValue = "",
	awayValue = "",
	winnerValue,
	isPlayoff = false,
	winnerDisabled = false,
	onChange,
	onScoreChange,
	status = "default",
	className,
}) => {
	return (
		<li className={cn(styles.card, className)} data-status={status}>
			<div className={styles.header}>
				<span className={styles.group}>{match.group}</span>
				<span className={styles.meta}>
					<span className={styles.time}>{match.time}</span>
					<span className={styles.date}>{match.date}</span>
				</span>
			</div>

			<div className={styles.rows}>
				<div className={styles.rowsGrid}>
					{isPlayoff && (
						<div className={styles.winnerCol}>
							<span className={styles.winnerLabel}>WINNER</span>
						</div>
					)}
					<div className={styles.betsCol}>
						<div className={styles.teamRow}>
							{isPlayoff && (
								<input
									type="radio"
									name={winnerFieldName}
									value="home"
									checked={winnerValue === "home"}
									disabled={winnerDisabled}
									aria-label={`Winner ${match.home.name}`}
									onChange={onChange}
								/>
							)}
							<ScoreInput
								name={homeFieldName}
								value={homeValue}
								className={styles.scoreInput}
								onChange={(e) => {
									onChange(e);
									onScoreChange?.("home", e.currentTarget.value);
								}}
							/>
							<TeamBadge
								name={match.home.name}
								flag={match.home.flag}
								size="m"
								className={styles.teamBadge}
							/>
						</div>
						<div className={styles.teamRow}>
							{isPlayoff && (
								<input
									type="radio"
									name={winnerFieldName}
									value="away"
									checked={winnerValue === "away"}
									disabled={winnerDisabled}
									aria-label={`Winner ${match.away.name}`}
									onChange={onChange}
								/>
							)}
							<ScoreInput
								name={awayFieldName}
								value={awayValue}
								className={styles.scoreInput}
								onChange={(e) => {
									onChange(e);
									onScoreChange?.("away", e.currentTarget.value);
								}}
							/>
							<TeamBadge
								name={match.away.name}
								flag={match.away.flag}
								size="m"
								className={styles.teamBadge}
							/>
						</div>
					</div>
				</div>
			</div>
		</li>
	);
};

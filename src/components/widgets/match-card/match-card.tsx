import type { FC } from "react";
import type { Match } from "@/types/api";
import { ScoreInput } from "@/components/shared/score-input";
import { TeamBadge } from "@/components/shared/team-badge";
import { cn } from "@/utils/lib";
import styles from "./match-card.module.scss";

export type CardStatus = "default" | "dirty" | "saved" | "error";

type Props = {
	match: Match;
	homeFieldName: string;
	awayFieldName: string;
	homeValue: string;
	awayValue: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	status?: CardStatus;
	className?: string;
};

export const MatchCard: FC<Props> = ({
	match,
	homeFieldName,
	awayFieldName,
	homeValue,
	awayValue,
	onChange,
	status = "default",
	className,
}) => {
	return (
		<div className={cn(styles.card, className)} data-status={status}>
			<span className={styles.group}>{match.group}</span>

			<TeamBadge
				name={match.home.name}
				flag={match.home.flag}
				direction="rtl"
				className={styles.team}
			/>

			<div className={styles.scores}>
				<ScoreInput
					name={homeFieldName}
					value={homeValue}
					onChange={onChange}
				/>
				<span className={styles.colon}>:</span>
				<ScoreInput
					name={awayFieldName}
					value={awayValue}
					onChange={onChange}
				/>
			</div>

			<TeamBadge
				name={match.away.name}
				flag={match.away.flag}
				className={styles.team}
			/>

			<div className={styles.meta}>
				<span>{match.time}</span>
				<span>{match.date}</span>
			</div>
		</div>
	);
};

import type { FC } from "react";
import type { Match } from "@/types/api";
import { ScoreInput } from "@/components/shared/score-input";
import { cn } from "@/utils/lib";
import styles from "./match-card.module.scss";

type Props = {
	match: Match;
	homeFieldName: string;
	awayFieldName: string;
	homeValue: string;
	awayValue: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	className?: string;
};

export const MatchCard: FC<Props> = ({
	match,
	homeFieldName,
	awayFieldName,
	homeValue,
	awayValue,
	onChange,
	className,
}) => {
	return (
		<div className={cn(styles.card, className)}>
			<div className={styles.header}>
				<span>{match.group}</span>
				<span>{match.time}</span>
				<span>{match.date}</span>
			</div>
			<div className={styles.body}>
				<div className={styles.team} data-side="home">
					<span className={styles.flag}>{match.home.flag}</span>
					<span className={styles.teamName}>{match.home.name}</span>
				</div>

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

				<div className={styles.team} data-side="away">
					<span className={styles.teamName}>{match.away.name}</span>
					<span className={styles.flag}>{match.away.flag}</span>
				</div>
			</div>
		</div>
	);
};

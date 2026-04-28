import type { FC } from "react";
import type { Match } from "@/types/api";
import { ScoreInput } from "@/components/shared/score-input";
import { BetItem } from "@/components/widgets/bet-item";
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
	const group = match.group.replace(/^Group\s*/i, "");

	return (
		<BetItem
			className={className}
			group={group}
			homeTeam={match.home.name}
			homeFlag={match.home.flag}
			awayTeam={match.away.name}
			awayFlag={match.away.flag}
			time={match.time}
			date={match.date}
			status={status}
			scoreSlot={
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
			}
		/>
	);
};

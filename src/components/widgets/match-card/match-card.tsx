import type { ChangeEvent, FC } from "react";
import type { Match } from "@/types/api";
import { ScoreInput } from "@/components/shared/score-input";
import { BetItem } from "@/components/widgets/bet-item";
import styles from "./match-card.module.scss";

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
						onChange={(e) => {
							onChange(e);
							onScoreChange?.("home", e.currentTarget.value);
						}}
					/>
					<span className={styles.colon}>:</span>
					<ScoreInput
						name={awayFieldName}
						value={awayValue}
						onChange={(e) => {
							onChange(e);
							onScoreChange?.("away", e.currentTarget.value);
						}}
					/>
				</div>
			}
			detailsSlot={
				isPlayoff ? (
					<fieldset
						className={styles.winner}
						disabled={winnerDisabled}
						data-selected={winnerValue !== "" || undefined}
					>
						<label className={styles.option} data-side="home">
							<input
								type="radio"
								name={winnerFieldName}
								value="home"
								checked={winnerValue === "home"}
								aria-label={`Winner ${match.home.name}`}
								onChange={onChange}
							/>
						</label>
						<span className={styles.winnerText}>Winner</span>
						<label className={styles.option} data-side="away">
							<input
								type="radio"
								name={winnerFieldName}
								value="away"
								checked={winnerValue === "away"}
								aria-label={`Winner ${match.away.name}`}
								onChange={onChange}
							/>
						</label>
					</fieldset>
				) : undefined
			}
		/>
	);
};

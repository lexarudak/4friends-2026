import type { FC } from "react";
import { TeamBadge } from "@/components/shared/team-badge";
import { BetItemResult } from "./bet-item-result";
import type { BetItemResultData } from "./bet-item-result";
import styles from "./bet-item.module.scss";

export type BetItemStatus = "pending" | "exact" | "win" | "miss";

type Props = {
	group: string;
	homeTeam: string;
	homeFlag: string;
	awayTeam: string;
	awayFlag: string;
	betHome: number;
	betAway: number;
	time: string;
	date: string;
	status: BetItemStatus;
	result?: BetItemResultData | null;
};

export const BetItem: FC<Props> = ({
	group,
	homeTeam,
	homeFlag,
	awayTeam,
	awayFlag,
	betHome,
	betAway,
	time,
	date,
	status,
	result,
}) => {
	return (
		<li className={styles.row} data-status={status} data-show-result={!!result}>
			<span className={styles.group}>Group {group}</span>

			<TeamBadge
				name={homeTeam}
				flag={homeFlag}
				direction="rtl"
				className={styles.team}
			/>

			<span className={styles.bet}>
				{betHome} : {betAway}
			</span>

			<TeamBadge name={awayTeam} flag={awayFlag} className={styles.team} />

			<span className={styles.meta}>
				<span className={styles.time}>{time}</span>
				<span className={styles.date}>{date}</span>
			</span>

			{result && <BetItemResult result={result} />}
		</li>
	);
};

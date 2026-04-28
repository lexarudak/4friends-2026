import type { FC, ReactNode } from "react";
import { TeamBadge } from "@/components/shared/team-badge";
import { BetItemResult } from "./bet-item-result";
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
			data-show-result={!!result || undefined}
		>
			<span className={styles.group}>Group {group}</span>

			<TeamBadge
				name={homeTeam}
				flag={homeFlag}
				direction="rtl"
				className={styles.team}
			/>

			{scoreSlot ?? (
				<span className={styles.bet}>
					{betHome} : {betAway}
				</span>
			)}

			<TeamBadge name={awayTeam} flag={awayFlag} className={styles.team} />

			<span className={styles.meta}>
				<span className={styles.time}>{time}</span>
				<span className={styles.date}>{date}</span>
			</span>

			{result && <BetItemResult result={result} />}
		</li>
	);
};

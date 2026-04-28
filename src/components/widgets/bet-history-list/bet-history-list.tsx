import type { FC } from "react";
import type { BetHistoryItem } from "@/db/bet-history";
import { cn } from "@/utils/lib";
import { SectionLabel } from "@/components/shared/section-label";
import { BetItem } from "@/components/widgets/bet-item";
import { getBetItemStatus } from "@/utils/bet";
import styles from "./bet-history-list.module.scss";

type Props = {
	items: BetHistoryItem[];
	className?: string;
};

export const BetHistoryList: FC<Props> = ({ items, className }) => {
	return (
		<div className={cn(styles.container, className)}>
			<SectionLabel label="Bets History" />
			<ul className={styles.list}>
				{items.map((item) => (
					<BetItem
						key={item.id}
						status={getBetItemStatus(item)}
						group={item.group}
						homeTeam={item.homeTeam}
						homeFlag={item.homeFlag}
						awayTeam={item.awayTeam}
						awayFlag={item.awayFlag}
						betHome={item.betHome}
						betAway={item.betAway}
						time={item.time}
						date={item.date}
						result={{
							home: item.resultHome,
							away: item.resultAway,
							points: item.points,
						}}
					/>
				))}
			</ul>
		</div>
	);
};

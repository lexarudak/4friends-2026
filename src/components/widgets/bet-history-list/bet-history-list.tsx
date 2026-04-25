import type { FC } from "react";
import type { BetHistoryItem } from "@/db/bet-history";
import { cn } from "@/utils/lib";
import { SectionLabel } from "@/components/shared/section-label";
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
				{items.map((item) => {
					const hasResult =
						item.resultHome !== null && item.resultAway !== null;
					const isExact =
						hasResult &&
						item.resultHome === item.betHome &&
						item.resultAway === item.betAway;
					const isWin =
						hasResult &&
						!isExact &&
						Math.sign(item.betHome - item.betAway) ===
							Math.sign(item.resultHome! - item.resultAway!);
					const status = !hasResult
						? "pending"
						: isExact
							? "exact"
							: isWin
								? "win"
								: "miss";

					return (
						<li key={item.id} className={styles.row} data-status={status}>
							<span className={styles.group}>Group {item.group}</span>

							<span className={styles.team} data-side="home">
								<span className={styles.teamName}>{item.homeTeam}</span>
								<span className={styles.flag}>{item.homeFlag}</span>
							</span>

							<span className={styles.bet}>
								{item.betHome} : {item.betAway}
							</span>

							<span className={styles.team} data-side="away">
								<span className={styles.flag}>{item.awayFlag}</span>
								<span className={styles.teamName}>{item.awayTeam}</span>
							</span>

							<span className={styles.meta}>
								<span className={styles.time}>{item.time}</span>
								<span className={styles.date}>{item.date}</span>
							</span>

							<span className={styles.result}>
								{hasResult ? (
									<>
										<span className={styles.resultLabel}>Result</span>
										<span className={styles.resultScore}>
											{item.resultHome} : {item.resultAway}
										</span>
									</>
								) : (
									<span className={styles.resultLabel}>Pending</span>
								)}
							</span>

							<span className={styles.points}>
								{item.points !== null ? (
									<>
										<span className={styles.pointsValue}>{item.points}</span>
										<span className={styles.pointsLabel}>pts</span>
									</>
								) : (
									<span className={styles.pointsDash}>—</span>
								)}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

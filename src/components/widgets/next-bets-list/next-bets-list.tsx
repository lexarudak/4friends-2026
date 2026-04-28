import type { FC } from "react";
import type { Match, Bet } from "@/types/api";
import { BetItem } from "@/components/widgets/bet-item";
import styles from "./next-bets-list.module.scss";

type Props = {
	matches: Match[];
	bets: Bet[];
};

export const NextBetsList: FC<Props> = ({ matches, bets }) => {
	const betsMap = Object.fromEntries(bets.map((b) => [b.matchId, b]));

	return (
		<ul className={styles.list}>
			{matches.map((match) => {
				const bet = betsMap[match.id];
				const group = match.group.replace(/^Group\s*/i, "");

				return (
					<BetItem
						key={match.id}
						group={group}
						homeTeam={match.home.name}
						homeFlag={match.home.flag}
						awayTeam={match.away.name}
						awayFlag={match.away.flag}
						betHome={bet?.home ?? 0}
						betAway={bet?.away ?? 0}
						time={match.time}
						date={match.date}
						status="pending"
						result={null}
					/>
				);
			})}
		</ul>
	);
};

import type { FC } from "react";
import type { WcGroup } from "@/db/world-cup";
import { TeamBadge } from "@/components/shared/team-badge";
import styles from "./group-standing.module.scss";

type Props = {
	group: WcGroup;
};

export const GroupStanding: FC<Props> = ({ group }) => {
	const sorted = [...group.teams].sort(
		(a, b) =>
			b.points - a.points ||
			b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
			b.goalsFor - a.goalsFor
	);

	return (
		<div className={styles.root}>
			<h3 className={styles.title}>{group.name}</h3>
			<div className={styles.table}>
				<div className={styles.header}>
					<span className={styles.pos}>#</span>
					<span className={styles.name} />
					<span className={styles.stat}>G</span>
					<span className={styles.stat}>GD</span>
					<span className={styles.stat}>P</span>
				</div>
				{sorted.map((team, i) => (
					<div key={team.name} className={styles.row} data-rank={i + 1}>
						<span className={styles.pos}>{i + 1}</span>
						<TeamBadge
							name={team.name}
							flag={team.flag}
							size="s"
							className={styles.name}
						/>
						<span className={styles.stat}>{team.played}</span>
						<span className={styles.stat}>
							{team.played > 0 ? `${team.goalsFor}:${team.goalsAgainst}` : "—"}
						</span>
						<span className={styles.stat}>{team.points}</span>
					</div>
				))}
			</div>
		</div>
	);
};

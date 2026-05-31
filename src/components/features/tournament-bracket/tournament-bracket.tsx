"use client";

import { useState } from "react";
import type { WcGroup, WcKnockoutMatch, WcKnockoutStage } from "@/db/world-cup";
import { GroupStanding } from "@/components/widgets/group-standing";
import { TeamBadge } from "@/components/shared/team-badge";
import { LocalDateTime } from "@/components/shared/local-datetime";
import { cn } from "@/utils/lib";
import styles from "./tournament-bracket.module.scss";

type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "final";

const STAGES: { id: Stage; label: string }[] = [
	{ id: "group", label: "Group" },
	{ id: "r32", label: "R32" },
	{ id: "r16", label: "R16" },
	{ id: "qf", label: "1/4" },
	{ id: "sf", label: "1/2" },
	{ id: "final", label: "Final" },
];

type Props = {
	groups: WcGroup[];
	knockout: Record<WcKnockoutStage, WcKnockoutMatch[]>;
};

function getWinnerSide(match: WcKnockoutMatch): "home" | "away" | null {
	// Never imply a winner for matches that aren't finished.
	if (match.status && match.status !== "finished") return null;
	if (match.winner) return match.winner;
	if (
		match.scoreHome == null ||
		match.scoreAway == null ||
		match.scoreHome === match.scoreAway
	) {
		return null;
	}
	return match.scoreHome > match.scoreAway ? "home" : "away";
}

export const TournamentBracket = ({ groups, knockout }: Props) => {
	const [stage, setStage] = useState<Stage>("group");

	return (
		<div className={styles.root}>
			<nav className={styles.tabs}>
				{STAGES.map((s) => (
					<button
						key={s.id}
						className={cn(styles.tab, stage === s.id && styles.tabActive)}
						onClick={() => setStage(s.id)}
					>
						{s.label}
					</button>
				))}
			</nav>

			{stage === "group" && (
				<div className={styles.groups}>
					{groups.map((group) => (
						<GroupStanding key={group.name} group={group} />
					))}
				</div>
			)}

			{stage !== "group" && (
				<div className={styles.knockoutGrid}>
					{knockout[stage].map((match) => {
						const winnerSide = getWinnerSide(match);

						return (
							<article key={match.id} className={styles.matchCard}>
								<div className={styles.matchMeta}>
									<span className={styles.matchRoundLabel}>
										{match.label ?? STAGES.find((s) => s.id === stage)?.label}
									</span>
									<span className={styles.matchDate}>
										{match.dateIso ? (
											<LocalDateTime
												iso={match.dateIso}
												fallback={`${match.date} ${match.time}`}
											/>
										) : (
											`${match.date} ${match.time}`
										)}
									</span>
								</div>

								<div className={styles.matchTeams}>
									<div className={styles.matchTeamRow}>
										<span
											className={cn(
												styles.winnerPointer,
												winnerSide === "home" && styles.winnerPointerActive
											)}
										/>
										<TeamBadge
											name={match.home.name}
											flag={match.home.flag}
											size="s"
											className={styles.teamBadge}
										/>
										<span className={styles.teamScore}>{match.scoreHome ?? "–"}</span>
									</div>
									<div className={styles.matchTeamRow}>
										<span
											className={cn(
												styles.winnerPointer,
												winnerSide === "away" && styles.winnerPointerActive
											)}
										/>
										<TeamBadge
											name={match.away.name}
											flag={match.away.flag}
											size="s"
											className={styles.teamBadge}
										/>
										<span className={styles.teamScore}>{match.scoreAway ?? "–"}</span>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}
		</div>
	);
};

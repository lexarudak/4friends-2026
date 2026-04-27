"use client";

import { useState } from "react";
import type { WcGroup } from "@/db/world-cup";
import { GroupStanding } from "@/components/widgets/group-standing";
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
};

export const TournamentBracket = ({ groups }: Props) => {
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
				<div className={styles.empty}>
					<p className={styles.emptyText}>Available after the group stage</p>
				</div>
			)}
		</div>
	);
};

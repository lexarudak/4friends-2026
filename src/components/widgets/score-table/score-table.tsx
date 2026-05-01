import type { FC } from "react";
import type { TableRow } from "@/types/api";
import { cn } from "@/utils/lib";
import { SectionLabel } from "@/components/shared/section-label";
import styles from "./score-table.module.scss";

type Props = {
	title: string;
	rows: TableRow[];
	currentUserRow?: TableRow;
	ghostCount?: number;
	href?: string;
	linkLabel?: string;
	className?: string;
	hidePosition?: boolean;
	hideScore?: boolean;
};

export const ScoreTable: FC<Props> = ({
	title,
	rows,
	currentUserRow,
	ghostCount = 0,
	href,
	linkLabel = "More statistic",
	className,
	hidePosition = false,
	hideScore = false,
}) => {
	return (
		<div className={cn(styles.container, className)}>
			{title && <SectionLabel label={title} />}

			<ul className={styles.list}>
				{rows.map((row) => (
					<li
						key={row.position}
						className={styles.row}
						data-first={(row.position === 1 && !hidePosition) || undefined}
						data-me={row.isCurrentUser || undefined}
						data-status={row.status || undefined}
					>
						{!hidePosition && (
							<span className={styles.position}>{row.position}</span>
						)}
						{row.tag && <span className={styles.tag}>{row.tag}</span>}
						<span className={styles.name}>{row.name}</span>
						{!hideScore && <span className={styles.score}>{row.score}</span>}
					</li>
				))}

				{Array.from({ length: ghostCount }).map((_, i) => (
					<li
						key={`ghost-${i}`}
						className={cn(styles.row, styles.ghost)}
						aria-hidden
					>
						{!hidePosition && <span className={styles.position}>&nbsp;</span>}
						<span className={styles.name}>&nbsp;</span>
						{!hideScore && <span className={styles.score}>&nbsp;</span>}
					</li>
				))}

				{currentUserRow && (
					<>
						<li className={styles.ellipsis} aria-hidden>
							<span>···</span>
						</li>
						<li className={styles.row} data-me>
							{!hidePosition && (
								<span className={styles.position}>
									{currentUserRow.position}
								</span>
							)}
							<span className={styles.name}>{currentUserRow.name}</span>
							{!hideScore && (
								<span className={styles.score}>{currentUserRow.score}</span>
							)}
						</li>
					</>
				)}
			</ul>

			{href && (
				<a href={href} className={styles.link}>
					{linkLabel}
				</a>
			)}
		</div>
	);
};

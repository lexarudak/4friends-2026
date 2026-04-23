import type { FC } from "react";
import type { TableRow } from "@/types/api";
import { cn } from "@/utils/lib";
import styles from "./score-table.module.scss";

type Props = {
	title: string;
	rows: TableRow[];
	currentUserRow?: TableRow;
	href?: string;
	linkLabel?: string;
	className?: string;
};

export const ScoreTable: FC<Props> = ({
	title,
	rows,
	currentUserRow,
	href,
	linkLabel = "More statistic",
	className,
}) => {
	return (
		<div className={cn(styles.container, className)}>
			<h3 className={styles.title}>{title}</h3>

			<ul className={styles.list}>
				{rows.map((row) => (
					<li
						key={row.position}
						className={styles.row}
						data-first={row.position === 1 || undefined}
						data-me={row.isCurrentUser || undefined}
					>
						<span className={styles.position}>{row.position}</span>
						<span className={styles.name}>{row.name}</span>
						<span className={styles.score}>{row.score}</span>
					</li>
				))}

				{currentUserRow && (
					<>
						<li className={styles.ellipsis} aria-hidden>
							<span>···</span>
						</li>
						<li className={styles.row} data-me>
							<span className={styles.position}>{currentUserRow.position}</span>
							<span className={styles.name}>{currentUserRow.name}</span>
							<span className={styles.score}>{currentUserRow.score}</span>
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

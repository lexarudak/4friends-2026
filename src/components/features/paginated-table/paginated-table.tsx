"use client";

import type { FC } from "react";
import { useState } from "react";
import type { TableRow } from "@/types/api";
import { ScoreTable } from "@/components/widgets/score-table";
import styles from "./paginated-table.module.scss";

type Props = {
	title?: string;
	rows: TableRow[];
	pageSize?: number;
	currentUserId?: string;
	tableClassName?: string;
	hidePosition?: boolean;
	hideScore?: boolean;
};

export const PaginatedTable: FC<Props> = ({
	title = "",
	rows,
	pageSize = 10,
	tableClassName,
	hidePosition,
	hideScore,
}) => {
	const [page, setPage] = useState(0);
	const totalPages = Math.ceil(rows.length / pageSize);
	const pageRows = rows.slice(page * pageSize, (page + 1) * pageSize);
	const isPaginated = rows.length > pageSize;
	const ghostCount = isPaginated ? pageSize - pageRows.length : 0;

	return (
		<div className={styles.wrapper}>
			<ScoreTable
				title={title}
				rows={pageRows}
				ghostCount={ghostCount}
				className={tableClassName}
				hidePosition={hidePosition}
				hideScore={hideScore}
			/>
			{totalPages > 1 && (
				<div className={styles.pagination}>
					<button
						className={styles.btn}
						onClick={() => setPage((p) => p - 1)}
						disabled={page === 0}
						aria-label="Previous page"
					>
						←
					</button>
					<span className={styles.pages}>
						{page + 1} / {totalPages}
					</span>
					<button
						className={styles.btn}
						onClick={() => setPage((p) => p + 1)}
						disabled={page === totalPages - 1}
						aria-label="Next page"
					>
						→
					</button>
				</div>
			)}
		</div>
	);
};

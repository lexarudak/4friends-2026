"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { TableRow } from "@/types/api";
import { PAGES } from "@/utils/constants";
import { ScoreTable } from "@/components/widgets/score-table";

type TableResponse = {
	rows: TableRow[];
};

export const TopTable = () => {
	const pathname = usePathname();
	const [rows, setRows] = useState<TableRow[]>([]);
	const [isFirstLoading, setIsFirstLoading] = useState(true);

	useEffect(() => {
		let isCancelled = false;

		const load = async () => {
			try {
				const response = await fetch("/api/table", { cache: "no-store" });
				if (!response.ok) return;

				const data = (await response.json()) as TableResponse;
				if (!isCancelled) {
					setRows(data.rows ?? []);
				}
			} catch {
				// keep previous data on transient errors
			} finally {
				if (!isCancelled) {
					setIsFirstLoading(false);
				}
			}
		};

		void load();

		return () => {
			isCancelled = true;
		};
	}, [pathname]);

	const topRows = useMemo(() => rows.slice(0, 3), [rows]);

	const currentUserRow = useMemo(() => {
		const topHasCurrentUser = topRows.some((row) => row.isCurrentUser);
		if (topHasCurrentUser) return undefined;
		return rows.find((row) => row.isCurrentUser);
	}, [rows, topRows]);

	if (isFirstLoading) {
		return (
			<ScoreTable
				title="Top 3"
				rows={[]}
				ghostCount={3}
				href={PAGES.ROOM_STATISTIC}
				linkLabel="More statistic"
			/>
		);
	}

	return (
		<ScoreTable
			title="Top 3"
			rows={topRows}
			currentUserRow={currentUserRow}
			href={PAGES.ROOM_STATISTIC}
			linkLabel="More statistic"
		/>
	);
};

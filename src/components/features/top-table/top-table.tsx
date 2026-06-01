"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { TableRow } from "@/types/api";
import { LIVE_MATCH_FINALIZED_EVENT, PAGES } from "@/utils/constants";
import { ScoreTable } from "@/components/widgets/score-table";
import { useI18n } from "@/i18n/provider";

type TableResponse = {
	rows: TableRow[];
};

export const TopTable = () => {
	const { t } = useI18n();
	const pathname = usePathname();
	const [rows, setRows] = useState<TableRow[]>([]);
	const [isFirstLoading, setIsFirstLoading] = useState(true);
	const isSigningOutRef = useRef(false);

	const load = useCallback(async () => {
		try {
			if (isSigningOutRef.current) return;

			const response = await fetch("/api/table", { cache: "no-store" });
			if (!response.ok) return;

			const data = (await response.json()) as TableResponse;
			const nextRows = data.rows ?? [];
			const hasCurrentUser = nextRows.some((row) => row.isCurrentUser);

			if (!hasCurrentUser) {
				isSigningOutRef.current = true;
				await signOut({ redirect: true, redirectTo: PAGES.LOGIN });
				return;
			}

			setRows(nextRows);
		} catch {
			// keep previous data on transient errors
		} finally {
			setIsFirstLoading(false);
		}
	}, []);

	// Fetch on mount, and again only when a live match finishes (points awarded
	// — signalled by the live timer).
	useEffect(() => {
		void load();
		const onFinalized = () => void load();
		window.addEventListener(LIVE_MATCH_FINALIZED_EVENT, onFinalized);
		return () =>
			window.removeEventListener(LIVE_MATCH_FINALIZED_EVENT, onFinalized);
	}, [load]);

	// The room statistic page is the leaderboard view and already queries it —
	// keep the sidebar Top 3 in sync when landing there.
	useEffect(() => {
		if (pathname === PAGES.ROOM_STATISTIC) void load();
	}, [pathname, load]);

	const topRows = useMemo(() => rows.slice(0, 3), [rows]);

	const currentUserRow = useMemo(() => {
		const topHasCurrentUser = topRows.some((row) => row.isCurrentUser);
		if (topHasCurrentUser) return undefined;
		return rows.find((row) => row.isCurrentUser);
	}, [rows, topRows]);

	if (isFirstLoading) {
		return (
			<ScoreTable
				title={t.home.top3}
				rows={[]}
				ghostCount={3}
				href={PAGES.ROOM_STATISTIC}
				linkLabel={t.home.moreStatistic}
			/>
		);
	}

	return (
		<ScoreTable
			title={t.home.top3}
			rows={topRows}
			currentUserRow={currentUserRow}
			href={PAGES.ROOM_STATISTIC}
			linkLabel={t.home.moreStatistic}
		/>
	);
};

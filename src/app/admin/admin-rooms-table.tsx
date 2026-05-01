"use client";

import { useEffect, useState } from "react";
import { PaginatedTable } from "@/components/features/paginated-table";
import type { TableRow } from "@/types/api";
import styles from "./page.module.scss";

type RoomItem = {
	id: string;
	name: string;
};

export function AdminRoomsTable() {
	const [rows, setRows] = useState<TableRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadRooms = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await fetch("/api/admin/rooms", {
					cache: "no-store",
				});

				if (!response.ok) {
					throw new Error("Failed to load rooms");
				}

				const rooms = (await response.json()) as RoomItem[];

				if (!isMounted) {
					return;
				}

				setRows(
					rooms.map((room, index) => ({
						position: index + 1,
						name: room.name,
						score: 0,
						tag: room.id.slice(0, 6),
					}))
				);
			} catch {
				if (!isMounted) {
					return;
				}

				setError("Could not load rooms");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadRooms();

		return () => {
			isMounted = false;
		};
	}, []);

	if (isLoading) {
		return <p className={styles.stateText}>Loading rooms…</p>;
	}

	if (error) {
		return (
			<p className={`${styles.stateText} ${styles.stateError}`}>{error}</p>
		);
	}

	if (!rows.length) {
		return <p className={styles.stateText}>No rooms found yet.</p>;
	}

	return (
		<div className={styles.tableWrap}>
			<p className={styles.helperText}>
				Showing all rooms currently stored in the database.
			</p>
			<PaginatedTable
				title="Existing rooms"
				rows={rows}
				pageSize={8}
				hideScore
			/>
		</div>
	);
}

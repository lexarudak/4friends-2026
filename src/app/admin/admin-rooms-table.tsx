"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/shared/button";
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
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newRoomName, setNewRoomName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [createError, setCreateError] = useState<string | null>(null);

	const loadRooms = useCallback(async () => {
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

			setRows(
				rooms.map((room, index) => ({
					position: index + 1,
					name: room.name,
					score: 0,
					tag: room.id.slice(0, 6),
				}))
			);
		} catch {
			setError("Could not load rooms");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadRooms();
	}, [loadRooms]);

	const handleCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const normalizedName = newRoomName.trim();

		if (normalizedName.length < 3 || normalizedName.length > 15) {
			setCreateError("Room name should be between 3 and 15 characters.");
			return;
		}

		try {
			setCreateError(null);
			setIsSubmitting(true);

			const response = await fetch("/api/admin/rooms", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name: normalizedName }),
			});

			if (!response.ok) {
				const payload = (await response.json()) as { message?: string };
				throw new Error(payload.message || "Could not create room");
			}

			setNewRoomName("");
			await loadRooms();
		} catch (requestError) {
			setCreateError(
				requestError instanceof Error
					? requestError.message
					: "Could not create room"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className={styles.tableWrap}>
			<form className={styles.form} onSubmit={handleCreateRoom}>
				<label className={styles.label} htmlFor="new-room-name">
					Add new room
				</label>
				<div className={styles.addRoomRow}>
					<input
						id="new-room-name"
						type="text"
						value={newRoomName}
						onChange={(event) => setNewRoomName(event.target.value)}
						placeholder="Room name"
						className={styles.input}
						minLength={3}
						maxLength={15}
						required
					/>
					<Button
						type="submit"
						isLoading={isSubmitting}
						className={styles.addRoomButton}
					>
						Add room
					</Button>
				</div>
				{createError && <p className={styles.error}>{createError}</p>}
			</form>

			<p className={styles.helperText}>
				Showing all rooms currently stored in the database.
			</p>

			{isLoading && <p className={styles.stateText}>Loading rooms…</p>}

			{!isLoading && error && (
				<p className={`${styles.stateText} ${styles.stateError}`}>{error}</p>
			)}

			{!isLoading && !error && !rows.length && (
				<p className={styles.stateText}>No rooms found yet.</p>
			)}

			{!isLoading && !error && rows.length > 0 && (
				<PaginatedTable
					title="Existing rooms"
					rows={rows}
					pageSize={8}
					hideScore
					hidePosition
				/>
			)}
		</div>
	);
}

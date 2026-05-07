"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/shared/button";
import { PaginatedTable } from "@/components/features/paginated-table";
import type { RoomItem, TableRow } from "@/types/api";
import { requestJson } from "@/utils/api-client";
import {
	getRoomNameLengthErrorMessage,
	isRoomNameLengthValid,
	ROOM_NAME_MAX_LENGTH,
	ROOM_NAME_MIN_LENGTH,
} from "@/utils/room";
import { mapRoomsToTableRows } from "./admin-rooms-table.helpers";
import styles from "./page.module.scss";

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

			const rooms = await requestJson<RoomItem[]>(
				"/api/admin/rooms",
				{ cache: "no-store" },
				"Could not load rooms"
			);

			setRows(mapRoomsToTableRows(rooms));
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

		if (!isRoomNameLengthValid(normalizedName)) {
			setCreateError(getRoomNameLengthErrorMessage());
			return;
		}

		try {
			setCreateError(null);
			setIsSubmitting(true);

			await requestJson<RoomItem>(
				"/api/admin/rooms",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ name: normalizedName }),
				},
				"Could not create room"
			);

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
						minLength={ROOM_NAME_MIN_LENGTH}
						maxLength={ROOM_NAME_MAX_LENGTH}
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

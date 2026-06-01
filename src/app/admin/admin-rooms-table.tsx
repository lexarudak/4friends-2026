"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/shared/button";
import type { RoomItem } from "@/types/api";
import { requestApi, requestJson } from "@/utils/api-client";
import { getTournamentLabel } from "@/lib/tournaments";
import {
	getRoomNameLengthErrorMessage,
	isRoomNameLengthValid,
	ROOM_NAME_MAX_LENGTH,
	ROOM_NAME_MIN_LENGTH,
} from "@/utils/room";
import styles from "./page.module.scss";

export function AdminRoomsTable() {
	const [rooms, setRooms] = useState<RoomItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newRoomName, setNewRoomName] = useState("");
	const [newRoomTournament, setNewRoomTournament] = useState("wc2026");
	const [newRoomPassword, setNewRoomPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [createError, setCreateError] = useState<string | null>(null);

	const [roomToDelete, setRoomToDelete] = useState<RoomItem | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const loadRooms = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const data = await requestJson<RoomItem[]>(
				"/api/admin/rooms",
				{ cache: "no-store" },
				"Could not load rooms"
			);

			setRooms(data);
		} catch {
			setError("Could not load rooms");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadRooms();
	}, [loadRooms]);

	const handleConfirmDelete = async () => {
		if (!roomToDelete) return;
		try {
			setIsDeleting(true);
			setDeleteError(null);

			const res = await requestApi("/api/admin/rooms", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: roomToDelete.name }),
			});
			if (!res.ok) throw new Error("Could not delete room");

			setRoomToDelete(null);
			await loadRooms();
		} catch {
			setDeleteError("Could not delete room");
		} finally {
			setIsDeleting(false);
		}
	};

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
					body: JSON.stringify({
						name: normalizedName,
						tournament: newRoomTournament,
						password: newRoomPassword.trim() || undefined,
					}),
				},
				"Could not create room"
			);

			setNewRoomName("");
			setNewRoomTournament("wc2026");
			setNewRoomPassword("");
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
					<input
						type="text"
						value={newRoomPassword}
						onChange={(e) => setNewRoomPassword(e.target.value)}
						placeholder="Password (optional)"
						className={styles.input}
						minLength={5}
					/>
					<select
						value={newRoomTournament}
						onChange={(e) => setNewRoomTournament(e.target.value)}
						className={styles.select}
					>
						<option value="wc2026">WC 2026</option>
						<option value="ucl2526">UCL 25/26</option>
						<option value="belarus1">Belarus First League</option>
					</select>
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

			{!isLoading && !error && !rooms.length && (
				<p className={styles.stateText}>No rooms found yet.</p>
			)}

			{!isLoading && !error && rooms.length > 0 && (
				<ul className={styles.roomList}>
					{rooms.map((room) => (
						<li key={room.id} className={styles.roomItem}>
							<span className={styles.roomName}>{room.name}</span>
							<span className={styles.roomMeta}>
								{getTournamentLabel(room.tournament ?? "wc2026")}
							</span>
							<span className={styles.roomMeta}>{room.password ?? "—"}</span>
							<button
								type="button"
								className={styles.roomDelete}
								aria-label={`Delete ${room.name}`}
								onClick={() => {
									setDeleteError(null);
									setRoomToDelete(room);
								}}
							>
								✕
							</button>
						</li>
					))}
				</ul>
			)}

			{roomToDelete && (
				<div
					className={styles.modalOverlay}
					onClick={() => !isDeleting && setRoomToDelete(null)}
				>
					<div
						className={styles.modal}
						role="dialog"
						aria-modal="true"
						onClick={(e) => e.stopPropagation()}
					>
						<p className={styles.modalText}>
							Delete room &laquo;{roomToDelete.name}&raquo;? This removes the room
							and all its bets.
						</p>
						{deleteError && <p className={styles.error}>{deleteError}</p>}
						<div className={styles.modalActions}>
							<Button
								type="button"
								color="red"
								isLoading={isDeleting}
								onClick={handleConfirmDelete}
							>
								Yes, delete
							</Button>
							<Button
								type="button"
								variant="outline"
								color="neutral"
								disabled={isDeleting}
								onClick={() => setRoomToDelete(null)}
							>
								No
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

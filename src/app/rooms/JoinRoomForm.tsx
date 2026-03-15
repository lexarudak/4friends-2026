"use client";

import { useActionState } from "react";
import { joinNewRoom, type JoinRoomState } from "./actions";
import styles from "./page.module.scss";

const initialState: JoinRoomState = { error: null };

export function JoinRoomForm() {
	const [state, formAction, isPending] = useActionState(joinNewRoom, initialState);

	return (
		<div className={styles.joinSection}>
			<span className={styles.joinLabel}>Join a new room</span>
			<form action={formAction} className={styles.inputRow}>
				<input
					name="room_id"
					type="text"
					placeholder="Enter room ID"
					className={`${styles.input} ${state.error ? styles.inputError : ""}`}
					autoComplete="off"
				/>
				<button type="submit" className={styles.joinBtn} disabled={isPending}>
					{isPending ? "Joining…" : "Join"}
				</button>
			</form>
			<p className={styles.errorMsg}>{state.error}</p>
		</div>
	);
}

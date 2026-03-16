"use client";

import { useActionState } from "react";
import { joinNewRoom, type JoinRoomState } from "@/app/rooms/actions";
import { Button } from "@/components/shared/button";
import { cn } from "@/utils/lib";
import styles from "./join-room-form.module.scss";

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
					className={cn(styles.input, { [styles.inputError]: !!state.error })}
					autoComplete="off"
				/>
				<Button color="green" isLoading={isPending}>
					Join
				</Button>
			</form>
			<p className={styles.errorMsg}>{state.error}</p>
		</div>
	);
}

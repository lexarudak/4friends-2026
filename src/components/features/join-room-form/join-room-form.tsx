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
			<form action={formAction} className={styles.form}>
				<input
					name="room_id"
					type="text"
					placeholder="Join a new room"
					className={cn(styles.input, { [styles.inputError]: !!state.error })}
					autoComplete="off"
				/>
				<Button color="neutral" isLoading={isPending}>
					Join
				</Button>
			</form>
			<p className={styles.errorMsg}>{state.error}</p>
		</div>
	);
}

"use client";

import { useActionState } from "react";
import { joinNewRoom, type JoinRoomState } from "@/app/rooms/actions";
import { Button } from "@/components/shared/button";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/utils/lib";
import styles from "./join-room-form.module.scss";

const initialState: JoinRoomState = { error: null };

export function JoinRoomForm() {
	const { t } = useI18n();
	const [state, formAction, isPending] = useActionState(joinNewRoom, initialState);

	return (
		<div className={styles.joinSection}>
			<form action={formAction} className={styles.form}>
				<input
					name="room_id"
					type="text"
					placeholder={t.rooms.roomName}
					className={cn(styles.input, { [styles.inputError]: !!state.error })}
					autoComplete="off"
				/>
				<input
					name="password"
					type="text"
					placeholder={t.rooms.password}
					className={styles.input}
					autoComplete="off"
				/>
				<Button color="neutral" isLoading={isPending}>
					{t.rooms.join}
				</Button>
			</form>
			<p className={styles.errorMsg}>{state.error}</p>
		</div>
	);
}

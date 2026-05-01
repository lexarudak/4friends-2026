"use client";

import { useActionState } from "react";
import { cn } from "@/utils/lib";
import { selectRoom } from "@/app/rooms/actions";
import styles from "./room-item.module.scss";

interface RoomItemProps {
	roomId: string;
	isActive: boolean;
}

export function RoomItem({ roomId, isActive }: RoomItemProps) {
	const [state, action, isPending] = useActionState(
		selectRoom.bind(null, roomId),
		null
	);

	return (
		<form action={action}>
			<button
				type="submit"
				disabled={isPending}
				className={cn(styles.roomItem, { [styles.active]: isActive })}
			>
				{roomId}
			</button>
			{state?.error && <p className={styles.error}>{state.error}</p>}
		</form>
	);
}

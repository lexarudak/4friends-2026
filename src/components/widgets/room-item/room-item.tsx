import { cn } from "@/utils/lib";
import { selectRoom } from "@/app/rooms/actions";
import styles from "./room-item.module.scss";

interface RoomItemProps {
	roomId: string;
	isActive: boolean;
}

export function RoomItem({ roomId, isActive }: RoomItemProps) {
	return (
		<form action={selectRoom.bind(null, roomId)}>
			<button
				type="submit"
				className={cn(styles.roomItem, { [styles.active]: isActive })}
			>
				{roomId}
			</button>
		</form>
	);
}

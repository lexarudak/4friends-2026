import { selectRoom } from "./actions";
import styles from "./page.module.scss";

type RoomItemProps = {
	roomId: string;
	isActive: boolean;
};

export function RoomItem({ roomId, isActive }: RoomItemProps) {
	return (
		<form action={selectRoom.bind(null, roomId)}>
			<button
				type="submit"
				className={`${styles.roomItem} ${isActive ? styles.active : ""}`}
			>
				{roomId}
			</button>
		</form>
	);
}

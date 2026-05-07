import { auth } from "@/auth";
import { RoomService } from "@/services/room.service";
import { signOutUser } from "./actions";
import { JoinRoomForm } from "@/components/features/join-room-form";
import { RoomItem } from "@/components/widgets/room-item";
import { CloseButton } from "@/components/shared/close-button";
import styles from "./page.module.scss";
import { PAGES } from "@/utils/constants";

export default async function RoomsPage() {
	const session = await auth();

	const currentRoom = session?.user?.current_room ?? null;
	const dbRooms = await RoomService.getAllRooms();
	const rooms = [
		...(currentRoom ? [currentRoom] : []),
		...dbRooms.map((room) => room.name),
	].filter((roomId, index, allRooms) => allRooms.indexOf(roomId) === index);

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<div className={styles.header}>
					{currentRoom && (
						<CloseButton
							linkArgs={{
								href: PAGES.HOME,
							}}
						/>
					)}

					<h1 className={styles.title}>Select a room</h1>
				</div>
				<ul className={styles.list}>
					{rooms.map((roomId) => (
						<li key={roomId}>
							<RoomItem roomId={roomId} isActive={roomId === currentRoom} />
						</li>
					))}
				</ul>
				<JoinRoomForm />
				<form action={signOutUser} className={styles.logoutRow}>
					<span>or</span>
					<button type="submit" className={styles.logoutBtn}>
						Logout
					</button>
				</form>
			</div>
		</div>
	);
}

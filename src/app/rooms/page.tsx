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



	const currentRoom = session?.user?.current_room;
	const rooms = session?.user?.email
		? await RoomService.getUserRooms(session.user.email)
		: [];



	return (
		<main className={styles.page}>
			<div className={styles.card}>
				<div className={styles.header}>
					{currentRoom && <CloseButton linkArgs={{
						href: PAGES.HOME,
					}} />}
					<p className={styles.label}>4Friends 2026</p>
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
					<button type="submit" className={styles.logoutBtn}>Logout</button>
				</form>
			</div>
		</main>
	);
}

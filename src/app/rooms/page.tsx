import { auth } from "@/auth";
import { RoomService } from "@/services/room.service";
import { signOutUser } from "./actions";
import { JoinRoomForm } from "@/components/features/join-room-form";
import { RoomItem } from "@/components/widgets/room-item";
import styles from "./page.module.scss";

export default async function RoomsPage() {
	const session = await auth();


	const rooms = session?.user?.email
		? await RoomService.getUserRooms(session.user.email)
		: [];

		

	return (
		<main className={styles.page}>
			<div className={styles.card}>
				<div className={styles.header}>
					<p className={styles.label}>4Friends 2026</p>
					<h1 className={styles.title}>Select a room</h1>
				</div>
				<ul className={styles.list}>
					{rooms.map((roomId) => (
						<li key={roomId}>
							<RoomItem roomId={roomId} isActive={roomId === session?.user?.current_room} />
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
